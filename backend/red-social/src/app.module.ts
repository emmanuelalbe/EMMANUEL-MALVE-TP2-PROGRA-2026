import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';

import { AppService } from './app.service';

import { AutenticacionModule } from './autenticacion/autenticacion.module';

import { PublicacionesModule } from './publicaciones/publicaciones.module';

import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true, envFilePath: '.env',}),
    MongooseModule.forRootAsync({inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_URI'),
        serverSelectionTimeoutMS: 10_000,
        connectTimeoutMS: 10_000,
      }),
    }),
    UsuariosModule,
    AutenticacionModule,
    PublicacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
