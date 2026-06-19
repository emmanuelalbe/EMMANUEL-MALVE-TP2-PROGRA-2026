import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { resolverUrlImagen, tieneImagen } from '../../core/imagen.util';
import { Publicacion } from '../../models/publicacion';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-publicacion',
  imports: [DatePipe, RouterLink],
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.css',
})
export class PublicacionComponent {
  @Input({ required: true }) publicacion!: Publicacion;
  @Input() usuarioActual: Usuario | null = null;
  @Input() mostrarComentarios = false;
  @Output() cambiarMeGusta = new EventEmitter<Publicacion>();
  @Output() eliminar = new EventEmitter<Publicacion>();

readonly maxComentariosVisibles = 3;
comentariosExpandidos = false;

get dioMeGusta(): boolean {
    const usuarioId = this.usuarioActual?._id;
    const meGustas = this.publicacion.usuariosMeGusta ?? [];
    return !!usuarioId && meGustas.includes(usuarioId);
  }

get puedeEliminar(): boolean {
    const usuarioId = this.usuarioActual?._id;
    const autorId = this.publicacion.usuario?._id;
    return (
      !!usuarioId &&
      (!!autorId && autorId === usuarioId || this.usuarioActual?.perfil === 'administrador')
    );
  }

imagenVisible = true;

get tieneImagenPublicacion(): boolean {
    return tieneImagen(this.publicacion.imagenUrl) && this.imagenVisible;
  }

imagenPublicacion(): string {
    return resolverUrlImagen(this.publicacion.imagenUrl);
  }

ocultarImagenRota(): void {
    this.imagenVisible = false;
  }

get comentariosVisibles() {
    const comentarios = this.publicacion.comentarios ?? [];
    return this.comentariosExpandidos
      ? comentarios
      : comentarios.slice(0, this.maxComentariosVisibles);
  }

get hayMasComentarios(): boolean {
    return (this.publicacion.comentarios ?? []).length > this.maxComentariosVisibles;
  }

alternarComentarios(): void {
    this.comentariosExpandidos = !this.comentariosExpandidos;
  }
}
