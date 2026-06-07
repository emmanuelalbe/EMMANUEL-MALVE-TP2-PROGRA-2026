import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PublicacionComponent } from '../../components/publicacion/publicacion';
import { API_URL } from '../../core/api.config';
import { obtenerMensajeError } from '../../core/http-error';
import { Publicacion } from '../../models/publicacion';
import { Usuario } from '../../models/usuario';
import { AutenticacionService } from '../../services/autenticacion.service';
import { PublicacionesService } from '../../services/publicaciones.service';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, PublicacionComponent],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfilComponent {
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly publicacionesService = inject(PublicacionesService);

  protected usuarioActual: Usuario | null = this.autenticacionService.obtenerSesion();
  protected ultimasPublicaciones: Publicacion[] = [];
  protected cargando = false;
  protected mensajeError = '';

  constructor() {
    this.cargarUltimasPublicaciones();
  }

  protected imagenPerfilUrl(): string {
    const imagenPerfilUrl = this.usuarioActual?.imagenPerfilUrl;

    if (!imagenPerfilUrl) {
      return '';
    }

    return imagenPerfilUrl.startsWith('http') ? imagenPerfilUrl : `${API_URL}${imagenPerfilUrl}`;
  }

  protected cambiarMeGusta(publicacion: Publicacion): void {
    const usuarioId = this.usuarioActual?._id;

    if (!usuarioId) {
      this.mensajeError = 'Tenes que iniciar sesion para dar me gusta.';
      return;
    }

    const yaDioMeGusta = publicacion.usuariosMeGusta.includes(usuarioId);
    const request = yaDioMeGusta
      ? this.publicacionesService.quitarMeGusta(publicacion._id, usuarioId)
      : this.publicacionesService.darMeGusta(publicacion._id, usuarioId);

    request.subscribe({
      next: (publicacionActualizada) => {
        this.ultimasPublicaciones = this.ultimasPublicaciones.map((item) =>
          item._id === publicacionActualizada._id ? publicacionActualizada : item,
        );
      },
      error: (error) => {
        this.mensajeError = obtenerMensajeError(error);
      },
    });
  }

  protected eliminarPublicacion(publicacion: Publicacion): void {
    if (!this.usuarioActual) {
      this.mensajeError = 'Tenes que iniciar sesion para eliminar publicaciones.';
      return;
    }

    const confirmar = window.confirm('Estas seguro de eliminar esta publicacion?');

    if (!confirmar) {
      return;
    }

    this.publicacionesService.eliminar(publicacion._id, this.usuarioActual).subscribe({
      next: () => {
        this.ultimasPublicaciones = this.ultimasPublicaciones.filter(
          (item) => item._id !== publicacion._id,
        );
      },
      error: (error) => {
        this.mensajeError = obtenerMensajeError(error);
      },
    });
  }

  protected comentarPublicacion(evento: {
    publicacion: Publicacion;
    texto: string;
  }): void {
    const usuarioId = this.usuarioActual?._id;

    if (!usuarioId) {
      this.mensajeError = 'Tenes que iniciar sesion para comentar.';
      return;
    }

    this.publicacionesService
      .comentar(evento.publicacion._id, usuarioId, evento.texto)
      .subscribe({
        next: (publicacionActualizada) => {
          this.ultimasPublicaciones = this.ultimasPublicaciones.map((item) =>
            item._id === publicacionActualizada._id ? publicacionActualizada : item,
          );
        },
        error: (error) => {
          this.mensajeError = obtenerMensajeError(error);
        },
      });
  }

  private cargarUltimasPublicaciones(): void {
    const usuarioId = this.usuarioActual?._id;

    if (!usuarioId) {
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    this.publicacionesService.listarUltimasDelUsuario(usuarioId).subscribe({
      next: (publicaciones) => {
        this.cargando = false;
        this.ultimasPublicaciones = Array.isArray(publicaciones) ? publicaciones : [];

        if (!Array.isArray(publicaciones)) {
          this.mensajeError = 'El backend de publicaciones todavia no esta implementado.';
        }
      },
      error: (error) => {
        this.cargando = false;
        this.ultimasPublicaciones = [];
        this.mensajeError = obtenerMensajeError(error);
      },
    });
  }
}
