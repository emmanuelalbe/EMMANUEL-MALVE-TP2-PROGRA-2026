import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { EliminarPublicacionDto } from './dto/eliminar-publicacion.dto';
import { MeGustaDto } from './dto/me-gusta.dto';
import { PublicacionesService } from './publicaciones.service';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads/publicaciones',
        filename: (_req, file, callback) => {
          const nombreUnico = `${Date.now()}${extname(file.originalname)}`;
          callback(null, nombreUnico);
        },
      }),
    }),
  )
  create(
    @Body() createPublicacionDto: CreatePublicacionDto,
    @UploadedFile() imagen: Express.Multer.File,
  ) {
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

  @Delete(':id/me-gusta')
  quitarMeGusta(@Param('id') id: string, @Body() datos: MeGustaDto) {
    return this.publicacionesService.quitarMeGusta(id, datos);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body() datos: EliminarPublicacionDto) {
    return this.publicacionesService.remove(id, datos);
  }
}
