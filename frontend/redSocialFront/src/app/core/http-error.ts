import { HttpErrorResponse } from '@angular/common/http';

export function obtenerMensajeError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado.';
  }

  const mensaje = error.error?.message;

  if (Array.isArray(mensaje)) {
    return mensaje.join('. ');
  }

  if (typeof mensaje === 'string') {
    return mensaje;
  }

  return 'Ocurrió un error al comunicarse con el servidor.';
}
