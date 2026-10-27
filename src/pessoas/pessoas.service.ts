import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarPessoaDto, AtualizarPessoaDto } from './pessoas.dto';
import { prismaError } from '../common';
@Injectable()
export class PessoasService {
  constructor(private prisma: PrismaService) {}
  async criar(dto: CriarPessoaDto) { try { return await this.prisma.pessoa.create({ data: dto }); } catch (e) { return prismaError(e); } }
  listar(ativo?: boolean, tipo?: any) { return this.prisma.pessoa.findMany({ where: { ...(ativo === undefined ? {} : { ativo }), ...(tipo ? { tipo } : {}) }, orderBy: { nome: 'asc' } }); }
  async buscar(id: number) { const p = await this.prisma.pessoa.findUnique({ where: { id } }); if (!p) throw new NotFoundException('Pessoa não encontrada.'); return p; }
  async atualizar(id: number, dto: AtualizarPessoaDto) { await this.buscar(id); try { return await this.prisma.pessoa.update({ where: { id }, data: dto }); } catch (e) { return prismaError(e); } }
  async desativar(id: number) { await this.buscar(id); return this.prisma.pessoa.update({ where: { id }, data: { ativo: false } }); }
  async remover(id: number) { await this.buscar(id); if (await this.prisma.chamado.count({ where: { OR: [{ solicitanteId: id }, { tecnicoId: id }] } })) throw new ConflictException('Pessoa vinculada a chamados não pode ser excluída; desative-a.'); try { return await this.prisma.pessoa.delete({ where: { id } }); } catch (e) { return prismaError(e); } }
}
