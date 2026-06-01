import { IsOptional, IsString } from 'class-validator';

export class CreatePublicacionDto {
  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsString()
  usuarioId: string;

  @IsOptional()
  @IsString()
  imagenUrl?: string;
}
