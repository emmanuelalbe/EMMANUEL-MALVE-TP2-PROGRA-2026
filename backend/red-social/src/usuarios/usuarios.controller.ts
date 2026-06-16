import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

const TAMAÑO_MAXIMO_IMAGEN = 2 * 1024 * 1024;
const TIPOS_IMAGEN_PERMITIDOS = ['image/png', 'image/jpg', 'image/jpeg'];

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  create(
    @Body() createUsuarioDto: CreateUsuarioDto,
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

    return this.usuariosService.create(createUsuarioDto, imagenPerfil);
  }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id/estado')
  obtenerEstado(@Param('id') id: string) {
    return this.usuariosService.obtenerEstado(id);
  }

  @Delete(':id')
  deshabilitar(@Param('id') id: string) {
    return this.usuariosService.deshabilitar(id);
  }

  @Post(':id/habilitacion')
  rehabilitar(@Param('id') id: string) {
    return this.usuariosService.rehabilitar(id);
  }
}
