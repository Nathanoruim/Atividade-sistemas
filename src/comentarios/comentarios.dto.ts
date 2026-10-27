import { IsInt, IsString, MinLength } from 'class-validator';
export class CriarComentarioDto { @IsInt() autorId: number; @IsString() @MinLength(1) conteudo: string; }
