import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { resolverUrlImagen, tieneImagen } from '../../core/imagen.util';
import { Publicacion } from '../../models/publicacion';

@Component({
  selector: 'app-publicacion-tarjeta',
  imports: [DatePipe, RouterLink],
  templateUrl: './publicacion-tarjeta.html',
  styleUrl: './publicacion-tarjeta.css',
})
export class PublicacionTarjetaComponent {
  @Input({ required: true }) publicacion!: Publicacion;

  imagenVisible = true;

  get tieneImagen(): boolean {
    return tieneImagen(this.publicacion.imagenUrl) && this.imagenVisible;
  }

  imagenUrl(): string {
    return resolverUrlImagen(this.publicacion.imagenUrl);
  }

  descripcionCorta(): string {
    const texto = this.publicacion.descripcion?.trim() ?? '';
    return texto.length > 110 ? `${texto.slice(0, 110)}...` : texto;
  }

  cantidadComentarios(): number {
    return this.publicacion.comentarios?.length ?? 0;
  }

  ocultarImagenRota(): void {
    this.imagenVisible = false;
  }
}
