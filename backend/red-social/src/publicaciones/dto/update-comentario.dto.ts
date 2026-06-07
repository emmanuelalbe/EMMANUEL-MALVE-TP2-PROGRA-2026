import { IsString } from 'class-validator';

export class UpdateComentarioDto {
  @IsString()
  texto: string;

  @IsString()
  usuarioId: string;
}
