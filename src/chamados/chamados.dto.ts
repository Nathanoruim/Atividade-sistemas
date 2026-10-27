import { IsEnum, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Prioridade, SituacaoChamado } from '@prisma/client';
export class CriarChamadoDto {
  @IsString() @MinLength(5) @MaxLength(100) titulo: string;
  @IsString() @MinLength(10) descricao: string;
  @IsInt() solicitanteId: number;
  @IsInt() tipoProblemaId: number;
  @IsOptional() @IsEnum(Prioridade) prioridade?: Prioridade;
}
export class AtribuirTecnicoDto { @IsInt() tecnicoId: number; }
export class AlterarSituacaoDto { @IsEnum(SituacaoChamado) situacao: SituacaoChamado; }
