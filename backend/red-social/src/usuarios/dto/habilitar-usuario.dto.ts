import { IsBoolean } from 'class-validator';

export class HabilitarUsuarioDto {
  @IsBoolean()
  habilitado: boolean;
}
