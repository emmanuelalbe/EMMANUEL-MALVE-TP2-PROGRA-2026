import { Injectable, inject, signal } from '@angular/core';
import { AutenticacionService } from './autenticacion.service';

const MINUTOS_AVISO = 10;

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly autenticacionService = inject(AutenticacionService);
  private timer?: ReturnType<typeof setTimeout>;

  readonly mostrarModal = signal(false);

  iniciarContador(): void {
    this.detenerContador();
    this.mostrarModal.set(false);

    this.timer = setTimeout(() => {
      this.mostrarModal.set(true);
    }, MINUTOS_AVISO * 60 * 1000);
  }

  extenderSesion(): void {
    this.autenticacionService.refrescar().subscribe({
      next: (respuesta) => {
        this.autenticacionService.actualizarToken(respuesta.token);
        this.iniciarContador();
      },
    });
  }

  rechazarExtension(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    this.mostrarModal.set(false);
  }

  detenerContador(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    this.mostrarModal.set(false);
  }
}
