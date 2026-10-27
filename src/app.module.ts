import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PessoasModule } from './pessoas/pessoas.module';
import { TiposProblemaModule } from './tipos-problema/tipos.module';
import { ChamadosModule } from './chamados/chamados.module';
import { ComentariosModule } from './comentarios/comentarios.module';

@Module({ imports: [PrismaModule, PessoasModule, TiposProblemaModule, ChamadosModule, ComentariosModule] })
export class AppModule {}
