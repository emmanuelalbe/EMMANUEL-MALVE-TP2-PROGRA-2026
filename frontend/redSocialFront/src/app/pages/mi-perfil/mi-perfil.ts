import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { PublicacionComponent } from '../../components/publicacion/publicacion';
import {
  MensajeModalComponent,
  ModalTipo,
} from '../../components/mensaje-modal/mensaje-modal';
import { resolverUrlImagen, tieneImagen } from '../../core/imagen.util';
import { obtenerMensajeError } from '../../core/http-error';
import { Publicacion } from '../../models/publicacion';
import { Usuario } from '../../models/usuario';
import { AutenticacionService } from '../../services/autenticacion.service';
import { PublicacionesService } from '../../services/publicaciones.service';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, MensajeModalComponent, PublicacionComponent],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfilComponent implements OnInit {
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly publicacionesService = inject(PublicacionesService);

  protected usuarioActual: Usuario | null = null;
  protected ultimasPublicaciones: Publicacion[] = [];
  protected cargando = false;
  protected errorCarga = false;
  protected modalVisible = false;
  protected modalTipo: ModalTipo = 'error';
  protected modalMensaje = '';

  ngOnInit(): void {
    this.usuarioActual = this.autenticacionService.obtenerSesion();
    this.cargarUltimasPublicaciones();
  }

  protected imagenPerfilUrl(): string {
    return resolverUrlImagen(this.usuarioActual?.imagenPerfilUrl);
  }

  protected tieneImagenPerfil(): boolean {
    return tieneImagen(this.usuarioActual?.imagenPerfilUrl);
  }

  protected cerrarModal(): void {
    this.modalVisible = false;
  }

  protected cambiarMeGusta(publicacion: Publicacion): void {
    const usuarioId = this.usuarioActual?._id;

    if (!usuarioId) {
      this.mostrarModal('error', 'Tenes que iniciar sesion para dar me gusta.');
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
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

  protected eliminarPublicacion(publicacion: Publicacion): void {
    if (!this.usuarioActual) {
      this.mostrarModal('error', 'Tenes que iniciar sesion para eliminar publicaciones.');
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
        this.mostrarModal('exito', 'Publicacion eliminada correctamente.');
      },
      error: (error) => {
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

  protected comentarPublicacion(evento: {
    publicacion: Publicacion;
    texto: string;
  }): void {
    const usuarioId = this.usuarioActual?._id;

    if (!usuarioId) {
      this.mostrarModal('error', 'Tenes que iniciar sesion para comentar.');
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
          this.mostrarModal('error', obtenerMensajeError(error));
        },
      });
  }

  private cargarUltimasPublicaciones(): void {
    const usuarioId = this.usuarioActual?._id;

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
