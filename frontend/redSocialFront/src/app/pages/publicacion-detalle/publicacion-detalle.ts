import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { obtenerMensajeError } from '../../core/http-error';
import { resolverUrlImagen, tieneImagen } from '../../core/imagen.util';
import { Comentario, Publicacion } from '../../models/publicacion';
import { Usuario } from '../../models/usuario';
import { AutenticacionService } from '../../services/autenticacion.service';
import { PublicacionesService } from '../../services/publicaciones.service';

@Component({
  selector: 'app-publicacion-detalle',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.css',
})
export class PublicacionDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly autenticacionService = inject(AutenticacionService);

  protected publicacion: Publicacion | null = null;
  protected comentarios: Comentario[] = [];
  protected usuarioActual: Usuario | null = this.autenticacionService.obtenerSesion();
  protected comentarioTexto = '';
  protected comentarioEditandoId: string | null = null;
  protected comentarioEditandoTexto = '';
  protected offset = 0;
  protected readonly limit = 3;
  protected hayMasComentarios = false;
  protected cargando = true;
  protected cargandoComentarios = false;
  protected mensajeError = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.mensajeError = 'Publicacion no encontrada.';
      this.cargando = false;
      return;
    }

    this.cargarPublicacion(id);
    this.cargarComentarios(id);
  }

  protected imagenVisible = true;

  protected get tieneImagenPublicacion(): boolean {
    return tieneImagen(this.publicacion?.imagenUrl) && this.imagenVisible;
  }

  protected imagenPublicacion(): string {
    return resolverUrlImagen(this.publicacion?.imagenUrl);
  }

  protected ocultarImagenRota(): void {
    this.imagenVisible = false;
  }

  protected get puedeEliminar(): boolean {
    const usuarioId = this.usuarioActual?._id;

    return (
      !!usuarioId &&
      !!this.publicacion &&
      (this.publicacion.usuario._id === usuarioId ||
        this.usuarioActual?.perfil === 'administrador')
    );
  }

  protected eliminarPublicacion(): void {
    if (!this.usuarioActual || !this.publicacion) {
      this.mensajeError = 'Tenes que iniciar sesion para eliminar publicaciones.';
      return;
    }

    const confirmar = window.confirm('Estas seguro de eliminar esta publicacion?');

    if (!confirmar) {
      return;
    }

    this.publicacionesService.eliminar(this.publicacion._id, this.usuarioActual).subscribe({
      next: () => {
        this.router.navigate(['/publicaciones']);
      },
      error: (error) => {
        this.mensajeError = obtenerMensajeError(error);
      },
    });
  }

  protected enviarComentario(): void {
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
        this.mensajeError = obtenerMensajeError(error);
      },
    });
  }

  protected cargarMasComentarios(): void {
    const publicacionId = this.publicacion?._id;

    if (!publicacionId) {
      return;
    }

    this.offset += this.limit;
    this.cargarComentarios(publicacionId, true);
  }

  protected iniciarEdicion(comentario: Comentario): void {
    this.comentarioEditandoId = comentario._id;
    this.comentarioEditandoTexto = comentario.texto;
  }

  protected cancelarEdicion(): void {
    this.comentarioEditandoId = null;
    this.comentarioEditandoTexto = '';
  }

  protected guardarEdicion(comentario: Comentario): void {
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
          this.mensajeError = obtenerMensajeError(error);
        },
      });
  }

  protected puedeEditar(comentario: Comentario): boolean {
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
        this.mensajeError = obtenerMensajeError(error);
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
        this.mensajeError = obtenerMensajeError(error);
      },
    });
  }
}
