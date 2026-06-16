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

  protected readonly maxComentariosVisibles = 3;
  protected comentariosExpandidos = false;

  protected get dioMeGusta(): boolean {
    const usuarioId = this.usuarioActual?._id;
    return usuarioId ? this.publicacion.usuariosMeGusta.includes(usuarioId) : false;
  }

  protected get puedeEliminar(): boolean {
    const usuarioId = this.usuarioActual?._id;
    return (
      !!usuarioId &&
      (this.publicacion.usuario._id === usuarioId ||
        this.usuarioActual?.perfil === 'administrador')
    );
  }

  protected imagenVisible = true;

  protected get tieneImagenPublicacion(): boolean {
    return tieneImagen(this.publicacion.imagenUrl) && this.imagenVisible;
  }

  protected imagenPublicacion(): string {
    return resolverUrlImagen(this.publicacion.imagenUrl);
  }

  protected ocultarImagenRota(): void {
    this.imagenVisible = false;
  }

  protected get comentariosVisibles() {
    return this.comentariosExpandidos
      ? this.publicacion.comentarios
      : this.publicacion.comentarios.slice(0, this.maxComentariosVisibles);
  }

  protected get hayMasComentarios(): boolean {
    return this.publicacion.comentarios.length > this.maxComentariosVisibles;
  }

  protected alternarComentarios(): void {
    this.comentariosExpandidos = !this.comentariosExpandidos;
  }
}
