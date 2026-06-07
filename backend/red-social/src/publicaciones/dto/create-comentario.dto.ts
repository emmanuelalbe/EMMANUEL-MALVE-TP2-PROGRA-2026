import { IsString } from 'class-validator';

export class CreateComentarioDto {
  @IsString()
  texto: string;

  @IsString()
  usuarioId: string;
}
