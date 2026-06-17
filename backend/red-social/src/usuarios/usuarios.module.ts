import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { Usuario, UsuarioSchema } from '../autenticacion/usuario.schema';
import { CloudinaryService } from '../publicaciones/cloudinary.service';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

@Module({
  imports: [
    AutenticacionModule,
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService, CloudinaryService],
})
export class UsuariosModule {}
