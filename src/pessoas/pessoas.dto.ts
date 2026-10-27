import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TipoPessoa } from '@prisma/client';
export class CriarPessoaDto {
  @IsString() @MinLength(2) @MaxLength(150) nome: string;
  @IsEmail() @MaxLength(254) email: string;
  @IsEnum(TipoPessoa) tipo: TipoPessoa;
}
export class AtualizarPessoaDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(150) nome?: string;
  @IsOptional() @IsEmail() @MaxLength(254) email?: string;
  @IsOptional() @IsEnum(TipoPessoa) tipo?: TipoPessoa;
  @IsOptional() @IsBoolean() ativo?: boolean;
}
