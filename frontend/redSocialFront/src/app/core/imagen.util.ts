import { API_URL } from './api.config';

export function tieneImagen(url?: string | null): boolean {
  return !!url?.trim();
}

export function resolverUrlImagen(url?: string | null): string {
  const imagenUrl = url?.trim();

  if (!imagenUrl) {
    return '';
  }

  return imagenUrl.startsWith('http') ? imagenUrl : `${API_URL}${imagenUrl}`;
}
