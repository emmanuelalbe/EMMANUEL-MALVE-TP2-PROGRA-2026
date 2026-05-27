import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AutenticacionService } from './autenticacion.service';
import { UsuarioLoginDTO, UsuarioRegistroDTO } from './usuario.dto';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('/registro')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: diskStorage({
        destination: './uploads/perfiles',
        filename: (_req, file, callback) => {
          const nombreUnico = `${Date.now()}${extname(file.originalname)}`;
          callback(null, nombreUnico);
        },
      }),
    }),
  )
  registrar(
    @Body() usuario: UsuarioRegistroDTO,
    @UploadedFile() imagenPerfil: Express.Multer.File,
  ) {
    return this.autenticacionService.registrar(usuario, imagenPerfil);
  }

  @Post('/login')
  login(@Body() usuario: UsuarioLoginDTO) {
    return this.autenticacionService.login(usuario);
  }
}
