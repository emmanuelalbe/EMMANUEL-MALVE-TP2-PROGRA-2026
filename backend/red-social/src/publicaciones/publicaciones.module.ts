import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from '../autenticacion/usuario.schema';
import { PublicacionesController } from './publicaciones.controller';
import {
  Publicacion,
  PublicacionSchema,
} from './entities/publicacion.entity';
import { PublicacionesService } from './publicaciones.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService],
})
export class PublicacionesModule {}
