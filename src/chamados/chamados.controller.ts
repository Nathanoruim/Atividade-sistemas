import { Body, Controller, Get, Param, ParseEnumPipe, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Prioridade, SituacaoChamado } from '@prisma/client';
import { ChamadosService } from './chamados.service';
import { AlterarSituacaoDto, AtribuirTecnicoDto, CriarChamadoDto } from './chamados.dto';
@Controller('chamados')
export class ChamadosController {
  constructor(private service: ChamadosService) {}
  @Post() criar(@Body() dto: CriarChamadoDto) { return this.service.criar(dto); }
  @Get() listar(
    @Query('situacao', new ParseEnumPipe(SituacaoChamado, { optional: true })) situacao?: SituacaoChamado,
    @Query('prioridade', new ParseEnumPipe(Prioridade, { optional: true })) prioridade?: Prioridade,
    @Query('solicitanteId', new ParseIntPipe({ optional: true })) solicitanteId?: number,
    @Query('tecnicoId', new ParseIntPipe({ optional: true })) tecnicoId?: number,
    @Query('tipoProblemaId', new ParseIntPipe({ optional: true })) tipoProblemaId?: number,
  ) {
    return this.service.listar({ situacao, prioridade, solicitanteId, tecnicoId, tipoProblemaId });
  }
  @Get(':id') buscar(@Param('id', ParseIntPipe) id: number) { return this.service.buscar(id); }
  @Patch(':id/tecnico') atribuir(@Param('id', ParseIntPipe) id: number, @Body() dto: AtribuirTecnicoDto) { return this.service.atribuir(id, dto); }
  @Patch(':id/situacao') situacao(@Param('id', ParseIntPipe) id: number, @Body() dto: AlterarSituacaoDto) { return this.service.alterarSituacao(id, dto); }
}
