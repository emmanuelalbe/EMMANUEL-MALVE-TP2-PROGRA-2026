import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { PublicacionComponent } from '../../components/publicacion/publicacion';
import { AuthFooterComponent } from '../../components/auth-footer/auth-footer';
import {
  MensajeModalComponent,
  ModalTipo,
} from '../../components/mensaje-modal/mensaje-modal';
import { resolverUrlImagen, tieneImagen } from '../../core/imagen.util';
import { obtenerMensajeError } from '../../core/http-error';
import { Publicacion } from '../../models/publicacion';
import { AutenticacionService } from '../../services/autenticacion.service';
import { PublicacionesService } from '../../services/publicaciones.service';

@Component({
  selector: 'app-mi-perfil',
  imports: [AuthFooterComponent, DatePipe, MensajeModalComponent, PublicacionComponent],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfilComponent implements OnInit {
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly publicacionesService = inject(PublicacionesService);

  readonly usuarioActual = this.autenticacionService.usuarioActual;
  readonly seguidores = 0;
  readonly siguiendo = 0;

  ultimasPublicaciones: Publicacion[] = [];
  cargando = false;
  errorCarga = false;
  modalVisible = false;
  modalTipo: ModalTipo = 'error';
  modalMensaje = '';

  ngOnInit(): void {
    this.cargarUltimasPublicaciones();
  }

  imagenPerfilUrl(): string {
    return resolverUrlImagen(this.usuarioActual()?.imagenPerfilUrl);
  }

  tieneImagenPerfil(): boolean {
    return tieneImagen(this.usuarioActual()?.imagenPerfilUrl);
  }

  inicialesUsuario(): string {
    const usuario = this.usuarioActual();
    if (!usuario) {
      return '?';
    }

    const nombre = usuario.nombre?.charAt(0) ?? '';
    const apellido = usuario.apellido?.charAt(0) ?? '';
    return `${nombre}${apellido}`.toUpperCase();
  }

  etiquetaRol(): string {
    const perfil = this.usuarioActual()?.perfil ?? 'usuario';
    return perfil === 'administrador' ? 'Administrador' : 'Usuario';
  }

  cantidadPublicaciones(): number {
    return this.ultimasPublicaciones.length;
  }

  editarPerfil(): void {
    this.mostrarModal('error', 'La edicion de perfil estara disponible proximamente.');
  }

  async compartirPerfil(): Promise<void> {
    const usuario = this.usuarioActual();
    if (!usuario) {
      return;
    }

    const url = window.location.href;
    const titulo = `Perfil de ${usuario.nombre} ${usuario.apellido}`;
    const texto = `Mira el perfil de @${usuario.nombreUsuario} en Red Social`;

    try {
      if (navigator.share) {
        await navigator.share({ title: titulo, text: texto, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      this.mostrarModal('exito', 'Enlace del perfil copiado al portapapeles.');
    } catch {
      this.mostrarModal('error', 'No se pudo compartir el perfil.');
    }
  }

  cerrarModal(): void {
    this.modalVisible = false;
  }

  cambiarMeGusta(publicacion: Publicacion): void {
    const usuarioId = this.usuarioActual()?._id;

    if (!usuarioId) {
      this.mostrarModal('error', 'Tenes que iniciar sesion para dar me gusta.');
      return;
    }

    const yaDioMeGusta = (publicacion.usuariosMeGusta ?? []).includes(usuarioId);
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
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

  eliminarPublicacion(publicacion: Publicacion): void {
    const usuario = this.usuarioActual();

    if (!usuario) {
      this.mostrarModal('error', 'Tenes que iniciar sesion para eliminar publicaciones.');
      return;
    }

    const confirmar = window.confirm('Estas seguro de eliminar esta publicacion?');

    if (!confirmar) {
      return;
    }

    this.publicacionesService.eliminar(publicacion._id, usuario).subscribe({
      next: () => {
        this.ultimasPublicaciones = this.ultimasPublicaciones.filter(
          (item) => item._id !== publicacion._id,
        );
        this.mostrarModal('exito', 'Publicacion eliminada correctamente.');
      },
      error: (error) => {
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

  private cargarUltimasPublicaciones(): void {
    const usuarioId = this.usuarioActual()?._id;

    if (!usuarioId) {
      return;
    }

    this.cargando = true;
    this.errorCarga = false;

    this.publicacionesService.listarUltimasDelUsuario(usuarioId).subscribe({
      next: (publicaciones) => {
        this.cargando = false;
        this.ultimasPublicaciones = Array.isArray(publicaciones) ? publicaciones : [];

        if (!Array.isArray(publicaciones)) {
          this.errorCarga = true;
          this.mostrarModal(
            'error',
            'El backend de publicaciones todavia no esta implementado.',
          );
        }
      },
      error: (error) => {
        this.cargando = false;
        this.ultimasPublicaciones = [];
        this.errorCarga = true;
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

  private mostrarModal(tipo: ModalTipo, mensaje: string): void {
    this.modalTipo = tipo;
    this.modalMensaje = mensaje;
    this.modalVisible = true;
  }
}
