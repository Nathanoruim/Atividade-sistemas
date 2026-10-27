import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseEnumPipe, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PessoasService } from './pessoas.service';
import { CriarPessoaDto, AtualizarPessoaDto } from './pessoas.dto';
import { TipoPessoa } from '@prisma/client';
@Controller('pessoas')
export class PessoasController {
  constructor(private service: PessoasService) {}
  @Post() criar(@Body() dto: CriarPessoaDto) { return this.service.criar(dto); }
  @Get() listar(@Query('ativo', new ParseBoolPipe({ optional: true })) ativo?: boolean, @Query('tipo', new ParseEnumPipe(TipoPessoa, { optional: true })) tipo?: TipoPessoa) { return this.service.listar(ativo, tipo); }
  @Get(':id') buscar(@Param('id', ParseIntPipe) id: number) { return this.service.buscar(id); }
  @Patch(':id') atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarPessoaDto) { return this.service.atualizar(id, dto); }
  @Patch(':id/desativar') desativar(@Param('id', ParseIntPipe) id: number) { return this.service.desativar(id); }
  @Delete(':id') remover(@Param('id', ParseIntPipe) id: number) { return this.service.remover(id); }
}
