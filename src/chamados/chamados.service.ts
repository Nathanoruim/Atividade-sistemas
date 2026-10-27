import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SituacaoChamado, TipoPessoa } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AlterarSituacaoDto, AtribuirTecnicoDto, CriarChamadoDto } from './chamados.dto';

const include = { solicitante: true, tecnico: true, tipoProblema: true } as const;
@Injectable()
export class ChamadosService {
  constructor(private prisma: PrismaService) {}
  async criar(dto: CriarChamadoDto) {
    const [solicitante, tipo] = await Promise.all([
      this.prisma.pessoa.findUnique({ where: { id: dto.solicitanteId } }),
      this.prisma.tipoProblema.findUnique({ where: { id: dto.tipoProblemaId } }),
    ]);
    if (!solicitante || !solicitante.ativo || solicitante.tipo !== TipoPessoa.SOLICITANTE) throw new BadRequestException('O chamado exige um solicitante existente e ativo.');
    if (!tipo || !tipo.ativo) throw new BadRequestException('O tipo de problema deve existir e estar ativo.');
    return this.prisma.chamado.create({ data: { ...dto, situacao: SituacaoChamado.ABERTO }, include });
  }
  listar(f: { situacao?: SituacaoChamado; prioridade?: any; solicitanteId?: number; tecnicoId?: number; tipoProblemaId?: number }) {
    return this.prisma.chamado.findMany({ where: f, include, orderBy: { criadoEm: 'desc' } });
  }
  async buscar(id: number) { const c = await this.prisma.chamado.findUnique({ where: { id }, include }); if (!c) throw new NotFoundException('Chamado não encontrado.'); return c; }
  async atribuir(id: number, dto: AtribuirTecnicoDto) {
    try {
      return await this.prisma.$transaction(async tx => {
        const c = await tx.chamado.findUnique({ where: { id } });
        if (!c) throw new NotFoundException('Chamado não encontrado.');
        if (c.situacao === SituacaoChamado.FECHADO || c.situacao === SituacaoChamado.CANCELADO) throw new ConflictException('Chamado fechado ou cancelado é imutável.');
        const tecnico = await tx.pessoa.findUnique({ where: { id: dto.tecnicoId } });
        if (!tecnico || !tecnico.ativo || tecnico.tipo !== TipoPessoa.TECNICO) throw new BadRequestException('Somente técnico ativo pode ser designado.');
        if (tecnico.id === c.solicitanteId) throw new BadRequestException('Técnico não pode atender o próprio chamado.');
        if (c.situacao === SituacaoChamado.ABERTO || c.situacao === SituacaoChamado.EM_ATENDIMENTO) {
          const count = await tx.chamado.count({ where: { tecnicoId: tecnico.id, situacao: SituacaoChamado.EM_ATENDIMENTO, id: { not: id } } });
          if (count >= 5) throw new ConflictException('Técnico já possui cinco chamados em atendimento.');
        }
        const situacao = c.situacao === SituacaoChamado.ABERTO ? SituacaoChamado.EM_ATENDIMENTO : c.situacao;
        return tx.chamado.update({ where: { id }, data: { tecnicoId: tecnico.id, situacao }, include });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2034') throw new ConflictException('Conflito concorrente na atribuição; tente novamente.');
      throw e;
    }
  }
  async alterarSituacao(id: number, dto: AlterarSituacaoDto) {
    try {
      return await this.prisma.$transaction(async tx => {
        const c = await tx.chamado.findUnique({ where: { id } });
        if (!c) throw new NotFoundException('Chamado não encontrado.');
        const permitidas: Record<SituacaoChamado, SituacaoChamado[]> = {
          ABERTO: [SituacaoChamado.EM_ATENDIMENTO, SituacaoChamado.CANCELADO],
          EM_ATENDIMENTO: [SituacaoChamado.RESOLVIDO, SituacaoChamado.CANCELADO],
          RESOLVIDO: [SituacaoChamado.EM_ATENDIMENTO, SituacaoChamado.FECHADO],
          FECHADO: [], CANCELADO: [],
        };
        if (!permitidas[c.situacao].includes(dto.situacao)) throw new ConflictException(`Transição ${c.situacao} → ${dto.situacao} não permitida.`);
        if (dto.situacao === SituacaoChamado.EM_ATENDIMENTO) {
          if (!c.tecnicoId) throw new BadRequestException('Designe um técnico antes de iniciar o atendimento.');
          const ativos = await tx.chamado.count({ where: { tecnicoId: c.tecnicoId, situacao: SituacaoChamado.EM_ATENDIMENTO, id: { not: id } } });
          if (ativos >= 5) throw new ConflictException('Técnico já possui cinco chamados em atendimento.');
        }
        return tx.chamado.update({ where: { id }, data: {
          situacao: dto.situacao,
          resolvidoEm: dto.situacao === SituacaoChamado.RESOLVIDO ? new Date() : dto.situacao === SituacaoChamado.EM_ATENDIMENTO ? null : c.resolvidoEm,
        }, include });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2034') throw new ConflictException('Conflito concorrente na alteração; tente novamente.');
      throw e;
    }
  }
}
