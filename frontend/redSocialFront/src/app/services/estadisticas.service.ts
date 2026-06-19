import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import {
  EstadisticaComentariosPorPeriodo,
  EstadisticaComentariosPorPublicacion,
  EstadisticaPublicacionesPorUsuario,
  RangoEstadisticas,
} from '../models/estadistica';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/estadisticas`;

  publicacionesPorUsuario(rango: RangoEstadisticas): Observable<EstadisticaPublicacionesPorUsuario[]> {
    return this.http.get<EstadisticaPublicacionesPorUsuario[]>(
      `${this.baseUrl}/publicaciones-por-usuario`,
      { params: this.crearParams(rango) },
    );
  }

  comentariosPorPeriodo(rango: RangoEstadisticas): Observable<EstadisticaComentariosPorPeriodo[]> {
    return this.http.get<EstadisticaComentariosPorPeriodo[]>(
      `${this.baseUrl}/comentarios-por-periodo`,
      { params: this.crearParams(rango) },
    );
  }

  comentariosPorPublicacion(
    rango: RangoEstadisticas,
  ): Observable<EstadisticaComentariosPorPublicacion[]> {
    return this.http.get<EstadisticaComentariosPorPublicacion[]>(
      `${this.baseUrl}/comentarios-por-publicacion`,
      { params: this.crearParams(rango) },
    );
  }

  private crearParams(rango: RangoEstadisticas): HttpParams {
    return new HttpParams().set('desde', rango.desde).set('hasta', rango.hasta);
  }
}
