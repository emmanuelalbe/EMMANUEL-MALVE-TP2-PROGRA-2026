import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { obtenerMensajeError } from '../../core/http-error';
import { PublicacionComponent } from '../../components/publicacion/publicacion';
import { OrdenPublicaciones, Publicacion } from '../../models/publicacion';
import { Usuario } from '../../models/usuario';
import { AutenticacionService } from '../../services/autenticacion.service';
import { PublicacionesService } from '../../services/publicaciones.service';

@Component({
  selector: 'app-publicaciones',
  imports: [PublicacionComponent, ReactiveFormsModule],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class PublicacionesComponent {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly formBuilder = inject(FormBuilder);

  protected publicaciones: Publicacion[] = [];
  protected imagenPublicacion: File | null = null;
  protected readonly publicacionForm = this.formBuilder.nonNullable.group({
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required],
  });
  protected usuarioActual: Usuario | null = this.autenticacionService.obtenerSesion();
  protected orden: OrdenPublicaciones = 'fecha';
  protected offset = 0;
  protected readonly limit = 5;
  protected cargando = false;
  protected mensajeError = '';

  constructor() {
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
      this.mensajeError = 'Tenes que iniciar sesion para dar me gusta.';
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
        this.publicaciones = this.publicaciones.filter((item) => item._id !== publicacion._id);
      },
      error: (error) => {
        this.mensajeError = obtenerMensajeError(error);
      },
    });
  }

  protected seleccionarImagenPublicacion(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imagenPublicacion = input.files?.[0] ?? null;
  }

  protected crearPublicacion(): void {
    if (this.publicacionForm.invalid) {
      this.publicacionForm.markAllAsTouched();
      return;
    }

    const usuarioId = this.usuarioActual?._id;

    if (!usuarioId) {
      this.mensajeError = 'Tenes que iniciar sesion para crear una publicacion.';
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
        this.offset = 0;
        this.cargarPublicaciones();
      },
      error: (error) => {
        this.mensajeError = obtenerMensajeError(error);
      },
    });
  }

  protected get paginaActual(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  protected get hayPaginaSiguiente(): boolean {
    return this.publicaciones.length === this.limit;
  }

  private cargarPublicaciones(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.publicacionesService
      .listar({
        orden: this.orden,
        offset: this.offset,
        limit: this.limit,
      })
      .subscribe({
        next: (publicaciones) => {
          this.cargando = false;
          this.publicaciones = Array.isArray(publicaciones) ? publicaciones : [];

          if (!Array.isArray(publicaciones)) {
            this.mensajeError = 'El backend de publicaciones todavia no esta implementado.';
          }
        },
        error: (error) => {
          this.cargando = false;
          this.publicaciones = [];
          this.mensajeError = obtenerMensajeError(error);
        },
      });
  }
}
