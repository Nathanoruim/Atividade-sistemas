
import { BadRequestException, Body, Controller, Get, Param, ParseEnumPipe, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Prioridade, SituacaoChamado } from '@prisma/client';
import { ChamadosService } from './chamados.service';
import { AlterarSituacaoDto, AtribuirTecnicoDto, CriarChamadoDto } from './chamados.dto';

function converterId(valor?: string): number | undefined {
  if (valor === undefined) return undefined;

  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero < 1) {
    throw new BadRequestException('O filtro de ID deve ser um número inteiro positivo.');
  }

  return numero;
}

@Controller('chamados')
export class ChamadosController {
  constructor(private service: ChamadosService) {}

  @Post()
  criar(@Body() dto: CriarChamadoDto) {
    return this.service.criar(dto);
  }

  @Get()
  listar(
    @Query('situacao', new ParseEnumPipe(SituacaoChamado, { optional: true }))
    situacao?: SituacaoChamado,
    @Query('prioridade', new ParseEnumPipe(Prioridade, { optional: true }))
    prioridade?: Prioridade,
    @Query('solicitanteId') solicitanteId?: string,
    @Query('tecnicoId') tecnicoId?: string,
    @Query('tipoProblemaId') tipoProblemaId?: string,
  ) {
    return this.service.listar({
      situacao,
      prioridade,
      solicitanteId: converterId(solicitanteId),
      tecnicoId: converterId(tecnicoId),
      tipoProblemaId: converterId(tipoProblemaId),
    });
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscar(id);
  }

  @Patch(':id/tecnico')
  atribuir(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtribuirTecnicoDto,
  ) {
    return this.service.atribuir(id, dto);
  }

  @Patch(':id/situacao')
  situacao(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AlterarSituacaoDto,
  ) {
    return this.service.alterarSituacao(id, dto);
  }
}
