import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { CriarComentarioDto } from './comentarios.dto';
@Controller('chamados/:id/comentarios')
export class ComentariosController {
  constructor(private service: ComentariosService) {}
  @Get() listar(@Param('id', ParseIntPipe) id: number) { return this.service.listar(id); }
  @Post() criar(@Param('id', ParseIntPipe) id: number, @Body() dto: CriarComentarioDto) { return this.service.criar(id, dto); }
}
