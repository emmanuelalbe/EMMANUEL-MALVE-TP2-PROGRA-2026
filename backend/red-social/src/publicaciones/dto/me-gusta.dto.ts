import { IsString } from 'class-validator';

export class MeGustaDto {
  @IsString()
  usuarioId: string;
}
