import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MensajeModalComponent,
  ModalTipo,
} from '../../components/mensaje-modal/mensaje-modal';
import { obtenerMensajeError } from '../../core/http-error';
import { PublicacionComponent } from '../../components/publicacion/publicacion';
import { OrdenPublicaciones, Publicacion } from '../../models/publicacion';
import { Usuario } from '../../models/usuario';
import { AutenticacionService } from '../../services/autenticacion.service';
import { PublicacionesService } from '../../services/publicaciones.service';

@Component({
  selector: 'app-publicaciones',
  imports: [MensajeModalComponent, PublicacionComponent, ReactiveFormsModule],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class PublicacionesComponent implements OnInit {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly formBuilder = inject(FormBuilder);

  protected publicaciones: Publicacion[] = [];
  protected imagenPublicacion: File | null = null;
  protected vistaPreviaImagen: string | null = null;
  protected readonly publicacionForm = this.formBuilder.nonNullable.group({
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required],
  });
  protected usuarioActual: Usuario | null = this.autenticacionService.obtenerSesion();
  protected orden: OrdenPublicaciones = 'fecha';
  protected offset = 0;
  protected readonly limit = 5;
  protected hayPaginaSiguiente = false;
  protected cargando = false;
  protected modalVisible = false;
  protected modalTipo: ModalTipo = 'error';
  protected modalMensaje = '';
  protected errorCarga = false;

  ngOnInit(): void {
    this.cargarPublicaciones();
  }

  protected cambiarOrden(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.orden = select.value as OrdenPublicaciones;
    this.offset = 0;
    this.cargarPublicaciones();
  }

  protected paginaAnterior(): void {
    if (this.offset === 0) {
      return;
    }

    this.offset = Math.max(0, this.offset - this.limit);
    this.cargarPublicaciones();
  }

  protected paginaSiguiente(): void {
    this.offset += this.limit;
    this.cargarPublicaciones();
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
        this.publicaciones = this.publicaciones.map((item) =>
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
        this.publicaciones = this.publicaciones.filter((item) => item._id !== publicacion._id);
        this.mostrarModal('exito', 'Publicacion eliminada correctamente.');
      },
      error: (error) => {
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

  protected seleccionarImagenPublicacion(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    if (this.vistaPreviaImagen) {
      URL.revokeObjectURL(this.vistaPreviaImagen);
    }

    this.imagenPublicacion = archivo;
    this.vistaPreviaImagen = archivo ? URL.createObjectURL(archivo) : null;
  }

  protected crearPublicacion(): void {
    if (this.publicacionForm.invalid) {
      this.publicacionForm.markAllAsTouched();
      return;
    }

    const usuarioId = this.usuarioActual?._id;

    if (!usuarioId) {
      this.mostrarModal('error', 'Tenes que iniciar sesion para crear una publicacion.');
      return;
    }

    const datos = this.publicacionForm.getRawValue();
    const formData = new FormData();

    formData.append('titulo', datos.titulo);
    formData.append('descripcion', datos.descripcion);
    formData.append('usuarioId', usuarioId);

    if (this.imagenPublicacion) {
      formData.append('imagen', this.imagenPublicacion);
    }

    this.publicacionesService.crear(formData).subscribe({
      next: () => {
        this.publicacionForm.reset();
        this.imagenPublicacion = null;

        if (this.vistaPreviaImagen) {
          URL.revokeObjectURL(this.vistaPreviaImagen);
          this.vistaPreviaImagen = null;
        }

        this.offset = 0;
        this.cargarPublicaciones();
        this.mostrarModal('exito', 'Publicacion cargada con exito.');
      },
      error: (error) => {
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

  protected cerrarModal(): void {
    this.modalVisible = false;
  }

  protected get paginaActual(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  private cargarPublicaciones(): void {
    this.cargando = true;
    this.errorCarga = false;

    this.publicacionesService
      .listar({
        orden: this.orden,
        offset: this.offset,
        limit: this.limit + 1,
      })
      .subscribe({
        next: (publicaciones) => {
          this.cargando = false;

          if (!Array.isArray(publicaciones)) {
            this.publicaciones = [];
            this.hayPaginaSiguiente = false;
            this.mostrarModal(
              'error',
              'El backend de publicaciones todavia no esta implementado.',
            );
            return;
          }

          if (publicaciones.length === 0 && this.offset > 0) {
            this.offset = Math.max(0, this.offset - this.limit);
            this.cargarPublicaciones();
            return;
          }

          this.hayPaginaSiguiente = publicaciones.length > this.limit;
          this.publicaciones = publicaciones.slice(0, this.limit);
        },
        error: (error) => {
          this.cargando = false;
          this.publicaciones = [];
          this.hayPaginaSiguiente = false;
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
