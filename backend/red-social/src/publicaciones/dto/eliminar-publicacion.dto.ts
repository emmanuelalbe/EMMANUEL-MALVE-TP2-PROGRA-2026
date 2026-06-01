import { IsString } from 'class-validator';

export class EliminarPublicacionDto {
  @IsString()
  usuarioId: string;

  @IsString()
  perfil: string;
}
