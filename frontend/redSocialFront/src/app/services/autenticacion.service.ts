import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import { LoginRequest, RegistroRequest, Usuario } from '../models/usuario';

const USUARIO_STORAGE_KEY = 'usuario';

@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/autenticacion`;

  login(datos: LoginRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/login`, datos);
  }

  registrar(datos: RegistroRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/registro`, datos);
  }

  guardarSesion(usuario: Usuario): void {
    localStorage.setItem(USUARIO_STORAGE_KEY, JSON.stringify(usuario));
  }

  obtenerSesion(): Usuario | null {
    const datos = localStorage.getItem(USUARIO_STORAGE_KEY);
    return datos ? (JSON.parse(datos) as Usuario) : null;
  }

  cerrarSesion(): void {
    localStorage.removeItem(USUARIO_STORAGE_KEY);
  }
}
