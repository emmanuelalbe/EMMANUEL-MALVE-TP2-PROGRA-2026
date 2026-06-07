import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export class ComentarioPublicacion {
  _id?: unknown;
  texto: string;
  usuarioId: string;
  fecha: Date;
}

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

  @Prop({
    type: [
      {
        texto: String,
        usuarioId: String,
        fecha: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  comentarios: ComentarioPublicacion[];
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
