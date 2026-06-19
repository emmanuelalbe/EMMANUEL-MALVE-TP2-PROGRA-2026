import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  MensajeModalComponent,
  ModalTipo,
} from '../../components/mensaje-modal/mensaje-modal';
import { obtenerMensajeError } from '../../core/http-error';
import { resolverUrlImagen, tieneImagen } from '../../core/imagen.util';
import { Comentario, Publicacion } from '../../models/publicacion';
import { Usuario } from '../../models/usuario';
import { AutenticacionService } from '../../services/autenticacion.service';
import { PublicacionesService } from '../../services/publicaciones.service';

@Component({
  selector: 'app-publicacion-detalle',
  imports: [DatePipe, FormsModule, MensajeModalComponent, RouterLink],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.css',
})
export class PublicacionDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly autenticacionService = inject(AutenticacionService);

publicacion: Publicacion | null = null;
comentarios: Comentario[] = [];
usuarioActual: Usuario | null = this.autenticacionService.obtenerSesion();
comentarioTexto = '';
comentarioEditandoId: string | null = null;
comentarioEditandoTexto = '';
offset = 0;
readonly limit = 3;
hayMasComentarios = false;
cargando = true;
cargandoComentarios = false;
errorCarga = false;
modalVisible = false;
modalTipo: ModalTipo = 'error';
modalMensaje = '';
  private redirigirTrasCerrar = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorCarga = true;
      this.cargando = false;
      this.mostrarModal('error', 'Publicacion no encontrada.');
      return;
    }

    this.cargarPublicacion(id);
    this.cargarComentarios(id);
  }

imagenVisible = true;

get tieneImagenPublicacion(): boolean {
    return tieneImagen(this.publicacion?.imagenUrl) && this.imagenVisible;
  }

imagenPublicacion(): string {
    return resolverUrlImagen(this.publicacion?.imagenUrl);
  }

ocultarImagenRota(): void {
    this.imagenVisible = false;
  }

get puedeEliminar(): boolean {
    const usuarioId = this.usuarioActual?._id;

    return (
      !!usuarioId &&
      !!this.publicacion &&
      (this.publicacion.usuario._id === usuarioId ||
        this.usuarioActual?.perfil === 'administrador')
    );
  }

eliminarPublicacion(): void {
    if (!this.usuarioActual || !this.publicacion) {
      this.mostrarModal('error', 'Tenes que iniciar sesion para eliminar publicaciones.');
      return;
    }

    const confirmar = window.confirm('Estas seguro de eliminar esta publicacion?');

    if (!confirmar) {
      return;
    }

    this.publicacionesService.eliminar(this.publicacion._id, this.usuarioActual).subscribe({
      next: () => {
        this.mostrarModal('exito', 'Publicacion eliminada correctamente.', true);
      },
      error: (error) => {
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

cerrarModal(): void {
    this.modalVisible = false;

    if (this.redirigirTrasCerrar) {
      this.redirigirTrasCerrar = false;
      this.router.navigate(['/publicaciones']);
    }
  }

enviarComentario(): void {
    const usuarioId = this.usuarioActual?._id;
    const texto = this.comentarioTexto.trim();
    const publicacionId = this.publicacion?._id;

    if (!usuarioId || !texto || !publicacionId) {
      return;
    }

    this.publicacionesService.comentar(publicacionId, usuarioId, texto).subscribe({
      next: () => {
        this.comentarioTexto = '';
        this.offset = 0;
        this.comentarios = [];
        this.cargarComentarios(publicacionId);
      },
      error: (error) => {
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

cargarMasComentarios(): void {
    const publicacionId = this.publicacion?._id;

    if (!publicacionId) {
      return;
    }

    this.offset += this.limit;
    this.cargarComentarios(publicacionId, true);
  }

iniciarEdicion(comentario: Comentario): void {
    this.comentarioEditandoId = comentario._id;
    this.comentarioEditandoTexto = comentario.texto;
  }

cancelarEdicion(): void {
    this.comentarioEditandoId = null;
    this.comentarioEditandoTexto = '';
  }

guardarEdicion(comentario: Comentario): void {
    const usuarioId = this.usuarioActual?._id;
    const publicacionId = this.publicacion?._id;
    const texto = this.comentarioEditandoTexto.trim();

    if (!usuarioId || !publicacionId || !texto) {
      return;
    }

    this.publicacionesService
      .modificarComentario(publicacionId, comentario._id, usuarioId, texto)
      .subscribe({
        next: (comentarioActualizado) => {
          this.comentarios = this.comentarios.map((item) =>
            item._id === comentarioActualizado._id ? comentarioActualizado : item,
          );
          this.cancelarEdicion();
        },
        error: (error) => {
          this.mostrarModal('error', obtenerMensajeError(error));
        },
      });
  }

puedeEditar(comentario: Comentario): boolean {
    return this.usuarioActual?._id === comentario.usuario._id;
  }

  private cargarPublicacion(id: string): void {
    this.publicacionesService.obtener(id).subscribe({
      next: (publicacion) => {
        this.publicacion = publicacion;
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.errorCarga = true;
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

  private cargarComentarios(id: string, agregar = false): void {
    this.cargandoComentarios = true;

    this.publicacionesService.listarComentarios(id, this.offset, this.limit).subscribe({
      next: (comentarios) => {
        this.cargandoComentarios = false;
        this.comentarios = agregar ? [...this.comentarios, ...comentarios] : comentarios;
        this.hayMasComentarios = comentarios.length === this.limit;
      },
      error: (error) => {
        this.cargandoComentarios = false;
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

  private mostrarModal(tipo: ModalTipo, mensaje: string, redirigir = false): void {
    this.modalTipo = tipo;
    this.modalMensaje = mensaje;
    this.redirigirTrasCerrar = redirigir;
    this.modalVisible = true;
  }
}
