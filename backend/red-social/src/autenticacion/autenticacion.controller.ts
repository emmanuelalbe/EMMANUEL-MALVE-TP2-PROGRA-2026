import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service';
import { UsuarioLoginDTO, UsuarioRegistroDTO } from './usuario.dto';

const TAMAÑO_MAXIMO_IMAGEN = 2 * 1024 * 1024;
const TIPOS_IMAGEN_PERMITIDOS = ['image/png', 'image/jpg', 'image/jpeg'];

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('/registro')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  registrar(
    @Body() usuario: UsuarioRegistroDTO,
    @UploadedFile() imagenPerfil?: Express.Multer.File,
  ) {
    if (imagenPerfil) {
      if (imagenPerfil.size > TAMAÑO_MAXIMO_IMAGEN) {
        throw new BadRequestException('archivo muy grande');
      }

      if (!TIPOS_IMAGEN_PERMITIDOS.includes(imagenPerfil.mimetype)) {
        throw new BadRequestException('tipo no permitido');
      }
    }

    return this.autenticacionService.registrar(usuario, imagenPerfil);
  }

  @Post('/login')
  login(@Body() usuario: UsuarioLoginDTO) {
    return this.autenticacionService.login(usuario);
  }

  @Post('/autorizar')
  autorizar(@Body('token') token: string, @Headers('authorization') authorization = '') {
    return this.autenticacionService.autorizar(
      this.obtenerToken(token, authorization),
    );
  }

  @Post('/refrescar')
  refrescar(@Body('token') token: string, @Headers('authorization') authorization = '') {
    return this.autenticacionService.refrescar(
      this.obtenerToken(token, authorization),
    );
  }

  private obtenerToken(token: string, authorization: string) {
    if (token) {
      return token;
    }

    return authorization.replace('Bearer ', '');
  }
}
