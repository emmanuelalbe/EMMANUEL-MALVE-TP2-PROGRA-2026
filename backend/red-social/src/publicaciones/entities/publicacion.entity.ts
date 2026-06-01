import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Publicacion {
  @Prop()
  titulo: string;

  @Prop()
  descripcion: string;

  @Prop()
  imagenUrl: string;

  @Prop()
  usuarioId: string;

  @Prop({ default: Date.now })
  fechaCreacion: Date;

  @Prop({ default: false })
  eliminada: boolean;

  @Prop({ type: [String], default: [] })
  usuariosMeGusta: string[];
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
