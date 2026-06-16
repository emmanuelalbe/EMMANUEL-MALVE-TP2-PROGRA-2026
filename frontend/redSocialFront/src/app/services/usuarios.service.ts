import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/usuarios`;

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  crear(datos: FormData): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, datos);
  }

  deshabilitar(usuarioId: string): Observable<Usuario> {
    return this.http.delete<Usuario>(`${this.baseUrl}/${usuarioId}`);
  }

  rehabilitar(usuarioId: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/${usuarioId}/habilitacion`, {});
  }
}
