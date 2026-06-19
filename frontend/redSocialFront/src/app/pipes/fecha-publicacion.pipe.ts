import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaPublicacion',
})
export class FechaPublicacionPipe implements PipeTransform {
  private readonly datePipe = new DatePipe('es-AR');

  transform(value: string | Date | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const fecha = new Date(value);
    const hoy = new Date();

    const esHoy =
      fecha.getDate() === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear();

    if (esHoy) {
      const hora = this.datePipe.transform(fecha, 'shortTime');
      return `hoy, ${hora}`;
    }

    return this.datePipe.transform(fecha, 'short');
  }
}
