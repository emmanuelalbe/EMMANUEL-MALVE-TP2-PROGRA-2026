import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { EliminarPublicacionDto } from './dto/eliminar-publicacion.dto';
import { MeGustaDto } from './dto/me-gusta.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { PublicacionesService } from './publicaciones.service';

const TAMAÑO_MAXIMO_IMAGEN = 2 * 1024 * 1024;

const TIPOS_IMAGEN_PERMITIDOS = ['image/png', 'image/jpg', 'image/jpeg'];

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen'))
  create(
    @Body() createPublicacionDto: CreatePublicacionDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    if (imagen) {
      if (imagen.size > TAMAÑO_MAXIMO_IMAGEN) {
        throw new BadRequestException('archivo muy grande');
      }

      if (!TIPOS_IMAGEN_PERMITIDOS.includes(imagen.mimetype)) {
        throw new BadRequestException('tipo no permitido');
      }
    }

    return this.publicacionesService.create(createPublicacionDto, imagen);
  }

  @Get()
  findAll(
    @Query('orden') orden?: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('usuarioId') usuarioId?: string,
  ) {
    return this.publicacionesService.findAll(orden, offset, limit, usuarioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicacionesService.findOne(id);
  }

  @Post(':id/me-gusta')
  darMeGusta(@Param('id') id: string, @Body() datos: MeGustaDto) {
    return this.publicacionesService.darMeGusta(id, datos);
  }

  @Post(':id/comentarios')
  comentar(@Param('id') id: string, @Body() datos: CreateComentarioDto) {
    return this.publicacionesService.comentar(id, datos);
  }

  @Get(':id/comentarios')
  listarComentarios(
    @Param('id') id: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    return this.publicacionesService.listarComentarios(id, offset, limit);
  }

  @Put(':id/comentarios/:comentarioId')
  modificarComentario(
    @Param('id') id: string,
    @Param('comentarioId') comentarioId: string,
    @Body() datos: UpdateComentarioDto,
  ) {
    return this.publicacionesService.modificarComentario(id, comentarioId, datos);
  }

  @Delete(':id/me-gusta')
  quitarMeGusta(@Param('id') id: string, @Body() datos: MeGustaDto) {
    return this.publicacionesService.quitarMeGusta(id, datos);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body() datos: EliminarPublicacionDto) {
    return this.publicacionesService.remove(id, datos);
  }
}
