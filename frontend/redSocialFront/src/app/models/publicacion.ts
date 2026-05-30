import { Usuario } from './usuario';

export type OrdenPublicaciones = 'fecha' | 'likes';

export interface Comentario {
  _id: string;
  texto: string;
  fecha: string;
  usuario: Usuario;
}

export interface Publicacion {
  _id: string;
  titulo: string;
  descripcion: string;
  imagenUrl?: string;
  fechaCreacion: string;
  usuario: Usuario;
  cantidadMeGusta: number;
  usuariosMeGusta: string[];
  comentarios: Comentario[];
}

export interface ListarPublicacionesParams {
  orden: OrdenPublicaciones;
  offset: number;
  limit: number;
  usuarioId?: string;
}
