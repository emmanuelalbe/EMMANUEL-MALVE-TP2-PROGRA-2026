import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { Usuario, UsuarioSchema } from '../autenticacion/usuario.schema';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { PublicacionesController } from './publicaciones.controller';
import {
  Publicacion,
  PublicacionSchema,
} from './entities/publicacion.entity';
import { CloudinaryService } from './cloudinary.service';
import { PublicacionesService } from './publicaciones.service';

@Module({
  imports: [
    AutenticacionModule,
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
  ],
  controllers: [PublicacionesController, EstadisticasController],
  providers: [PublicacionesService, EstadisticasService, CloudinaryService],
})
export class PublicacionesModule {}
