import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import { LoginRequest, RefrescarResponse, Usuario } from '../models/usuario';

const USUARIO_STORAGE_KEY = 'usuario';
const TOKEN_STORAGE_KEY = 'token';

@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/autenticacion`;

  login(datos: LoginRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/login`, datos);
  }

  registrar(datos: FormData): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/registro`, datos);
  }

  autorizar(): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/autorizar`, {
      token: this.obtenerToken(),
    });
  }

  refrescar(): Observable<RefrescarResponse> {
    return this.http.post<RefrescarResponse>(`${this.baseUrl}/refrescar`, {
      token: this.obtenerToken(),
    });
  }

  guardarSesion(usuario: Usuario): void {
    const { token, ...usuarioSinToken } = usuario;

    localStorage.setItem(USUARIO_STORAGE_KEY, JSON.stringify(usuarioSinToken));

    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  }

  actualizarToken(token: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  obtenerSesion(): Usuario | null {
    const datos = localStorage.getItem(USUARIO_STORAGE_KEY);
    return datos ? (JSON.parse(datos) as Usuario) : null;
  }

  cerrarSesion(): void {
    localStorage.removeItem(USUARIO_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}
