import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarTipoDto, AtualizarTipoDto } from './tipos.dto';
import { prismaError } from '../common';
@Injectable()
export class TiposService {
  constructor(private prisma: PrismaService) {}
  async criar(dto: CriarTipoDto) { try { return await this.prisma.tipoProblema.create({ data: dto }); } catch (e) { return prismaError(e); } }
  listar(ativo?: boolean) { return this.prisma.tipoProblema.findMany({ where: ativo === undefined ? {} : { ativo }, orderBy: { nome: 'asc' } }); }
  async buscar(id: number) { const t = await this.prisma.tipoProblema.findUnique({ where: { id } }); if (!t) throw new NotFoundException('Tipo de problema não encontrado.'); return t; }
  async atualizar(id: number, dto: AtualizarTipoDto) { await this.buscar(id); try { return await this.prisma.tipoProblema.update({ where: { id }, data: dto }); } catch (e) { return prismaError(e); } }
  async desativar(id: number) { await this.buscar(id); return this.prisma.tipoProblema.update({ where: { id }, data: { ativo: false } }); }
  async remover(id: number) { await this.buscar(id); if (await this.prisma.chamado.count({ where: { tipoProblemaId: id } })) throw new ConflictException('Tipo vinculado a chamados não pode ser excluído; desative-o.'); try { return await this.prisma.tipoProblema.delete({ where: { id } }); } catch (e) { return prismaError(e); } }
}
