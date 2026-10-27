import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export class CriarTipoDto { @IsString() @MinLength(2) @MaxLength(120) nome: string; }
export class AtualizarTipoDto { @IsOptional() @IsString() @MinLength(2) @MaxLength(120) nome?: string; @IsOptional() @IsBoolean() ativo?: boolean; }
