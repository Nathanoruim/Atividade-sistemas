
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { SituacaoChamado, TipoPessoa } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CriarComentarioDto } from './comentarios.dto';

@Injectable()
export class ComentariosService {
  constructor(private prisma: PrismaService) {}

  async listar(chamadoId: number) {
    if (
      !await this.prisma.chamado.findUnique({
        where: { id: chamadoId },
        select: { id: true },
      })
    ) {
      throw new NotFoundException('Chamado não encontrado.');
    }

    return this.prisma.comentario.findMany({
      where: { chamadoId },
      include: { autor: true },
      orderBy: { criadoEm: 'asc' },
    });
  }

  async criar(chamadoId: number, dto: CriarComentarioDto) {
    const conteudo = dto.conteudo.trim();

    if (!conteudo) {
      throw new BadRequestException('Comentário não pode ser vazio.');
    }

    return this.prisma.$transaction(async (tx) => {
      const chamado = await tx.chamado.findUnique({
        where: { id: chamadoId },
      });

      if (!chamado) {
        throw new NotFoundException('Chamado não encontrado.');
      }

      if (
        chamado.situacao === SituacaoChamado.FECHADO ||
        chamado.situacao === SituacaoChamado.CANCELADO
      ) {
        throw new ConflictException(
          'Chamado fechado ou cancelado não recebe comentários.',
        );
      }

      const autor = await tx.pessoa.findUnique({
        where: { id: dto.autorId },
      });

      if (!autor || !autor.ativo) {
        throw new BadRequestException('Autor deve ser uma pessoa ativa.');
      }

      const solicitante =
        autor.id === chamado.solicitanteId &&
        autor.tipo === TipoPessoa.SOLICITANTE;

      const tecnico =
        autor.id === chamado.tecnicoId &&
        autor.tipo === TipoPessoa.TECNICO;

      if (!solicitante && !tecnico) {
        throw new BadRequestException(
          'Somente solicitante ou técnico responsável podem comentar.',
        );
      }

      return tx.comentario.create({
        data: {
          chamadoId,
          autorId: autor.id,
          conteudo,
        },
        include: { autor: true },
      });
    });
  }
}
