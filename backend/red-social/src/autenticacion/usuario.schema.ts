import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Usuario {
  @Prop()
  nombre: string;

  @Prop()
  apellido: string;

  @Prop({ unique: true })
  correo: string;

  @Prop({ unique: true })
  nombreUsuario: string;

  @Prop()
  contraseña: string;

  @Prop()
  fechaNacimiento: string;

  @Prop()
  descripcion: string;

  @Prop()
  imagenPerfilUrl: string;

  @Prop({ default: 'usuario' })
  perfil: string;

  @Prop({ default: true })
  habilitado: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
