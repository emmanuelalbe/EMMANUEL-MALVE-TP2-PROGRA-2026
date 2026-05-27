import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class UsuarioRegistroDTO {
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
}

export class UsuarioLoginDTO {
  @IsString()
  identifier: string;

  @IsString()
  password: string;
}
