import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { API_URL } from '../../core/api.config';
import { Publicacion } from '../../models/publicacion';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-publicacion',
  imports: [DatePipe],
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.css',
})
export class PublicacionComponent {
  @Input({ required: true }) publicacion!: Publicacion;
  @Input() usuarioActual: Usuario | null = null;
  @Output() cambiarMeGusta = new EventEmitter<Publicacion>();
  @Output() eliminar = new EventEmitter<Publicacion>();

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

  protected imagenPublicacion(): string {
    const imagenUrl = this.publicacion.imagenUrl;

    if (!imagenUrl) {
      return '';
    }

    return imagenUrl.startsWith('http') ? imagenUrl : `${API_URL}${imagenUrl}`;
  }
}
