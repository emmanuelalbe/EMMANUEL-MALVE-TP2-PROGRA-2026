export interface EstadisticaPublicacionesPorUsuario {
  usuarioId: string;
  etiqueta: string;
  cantidad: number;
}

export interface EstadisticaComentariosPorPeriodo {
  fecha: string;
  cantidad: number;
}

export interface EstadisticaComentariosPorPublicacion {
  publicacionId: string;
  etiqueta: string;
  cantidad: number;
}

export interface RangoEstadisticas {
  desde: string;
  hasta: string;
}
