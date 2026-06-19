import { HttpErrorResponse } from '@angular/common/http';

export function obtenerMensajeError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado.';
  }

  const cuerpo = error.error;
  const mensaje = cuerpo?.message ?? (typeof cuerpo === 'string' ? cuerpo : null);

  if (Array.isArray(mensaje)) {
    return mensaje.join('. ');
  }

  if (typeof mensaje === 'string') {
    return mensaje;
  }

  if (error.status === 404) {
    return 'El recurso solicitado no existe en el servidor. Verificá que el backend esté actualizado.';
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el servidor.';
  }

  return 'Ocurrió un error al comunicarse con el servidor.';
}
