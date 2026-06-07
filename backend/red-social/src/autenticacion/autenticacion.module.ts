import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryService } from '../publicaciones/cloudinary.service';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { Usuario, UsuarioSchema } from './usuario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    JwtModule.register({}),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService, CloudinaryService],
})
export class AutenticacionModule {}
