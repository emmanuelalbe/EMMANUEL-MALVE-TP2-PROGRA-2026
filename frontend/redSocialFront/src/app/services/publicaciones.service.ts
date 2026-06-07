import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import { ListarPublicacionesParams, Publicacion } from '../models/publicacion';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/publicaciones`;

  listar(params: ListarPublicacionesParams): Observable<Publicacion[]> {
    let httpParams = new HttpParams()
      .set('orden', params.orden)
      .set('offset', params.offset)
      .set('limit', params.limit);

    if (params.usuarioId) {
      httpParams = httpParams.set('usuarioId', params.usuarioId);
    }

    return this.http.get<Publicacion[]>(this.baseUrl, { params: httpParams });
  }

  crear(datos: FormData): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.baseUrl, datos);
  }

  listarUltimasDelUsuario(usuarioId: string, limit = 3): Observable<Publicacion[]> {
    return this.listar({
      orden: 'fecha',
      offset: 0,
      limit,
      usuarioId,
    });
  }

  darMeGusta(publicacionId: string, usuarioId: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.baseUrl}/${publicacionId}/me-gusta`, {
      usuarioId,
    });
  }

  quitarMeGusta(publicacionId: string, usuarioId: string): Observable<Publicacion> {
    return this.http.delete<Publicacion>(`${this.baseUrl}/${publicacionId}/me-gusta`, {
      body: { usuarioId },
    });
  }

  comentar(
    publicacionId: string,
    usuarioId: string,
    texto: string,
  ): Observable<Publicacion> {
    return this.http.post<Publicacion>(
      `${this.baseUrl}/${publicacionId}/comentarios`,
      { usuarioId, texto },
    );
  }

  eliminar(publicacionId: string, usuario: Usuario): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${publicacionId}`, {
      body: {
        usuarioId: usuario._id,
        perfil: usuario.perfil,
      },
    });
  }
}
