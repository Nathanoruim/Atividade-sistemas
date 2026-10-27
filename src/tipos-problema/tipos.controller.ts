import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { TiposService } from './tipos.service';
import { CriarTipoDto, AtualizarTipoDto } from './tipos.dto';
@Controller('tipos-problema')
export class TiposController {
  constructor(private service: TiposService) {}
  @Post() criar(@Body() dto: CriarTipoDto) { return this.service.criar(dto); }
  @Get() listar(@Query('ativo', new ParseBoolPipe({ optional: true })) ativo?: boolean) { return this.service.listar(ativo); }
  @Get(':id') buscar(@Param('id', ParseIntPipe) id: number) { return this.service.buscar(id); }
  @Patch(':id') atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarTipoDto) { return this.service.atualizar(id, dto); }
  @Patch(':id/desativar') desativar(@Param('id', ParseIntPipe) id: number) { return this.service.desativar(id); }
  @Delete(':id') remover(@Param('id', ParseIntPipe) id: number) { return this.service.remover(id); }
}
