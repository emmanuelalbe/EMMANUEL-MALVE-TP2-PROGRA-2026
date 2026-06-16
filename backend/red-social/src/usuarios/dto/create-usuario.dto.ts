import { IsEmail, IsIn, IsString, Matches, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsEmail()
  correo: string;

  @IsString()
  nombreUsuario: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
  })
  password: string;

  @IsString()
  repetirPassword: string;

  @IsString()
  fechaNacimiento: string;

  @IsString()
  descripcion: string;

  @IsString()
  @IsIn(['usuario', 'administrador'])
  perfil: string;
}
