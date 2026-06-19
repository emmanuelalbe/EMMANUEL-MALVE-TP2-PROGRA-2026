import { DatePipe } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaPublicacion',
})
export class FechaPublicacionPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);
  private readonly datePipe = new DatePipe(this.locale);

  transform(value: string | Date | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const fecha = new Date(value);

    if (Number.isNaN(fecha.getTime())) {
      return null;
    }

    const hoy = new Date();

    const esHoy =
      fecha.getDate() === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear();

    if (esHoy) {
      const hora = this.datePipe.transform(fecha, 'shortTime');
      return hora ? `hoy, ${hora}` : null;
    }

    return this.datePipe.transform(fecha, 'short');
  }
}
