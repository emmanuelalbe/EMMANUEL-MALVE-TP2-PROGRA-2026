import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from '../autenticacion/usuario.schema';
import { Publicacion } from './entities/publicacion.entity';

type RangoFechas = {
  desde: Date;
  hasta: Date;
};

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<Usuario>,
  ) {}

  async publicacionesPorUsuario(desde: string, hasta: string) {
    const rango = this.parsearRango(desde, hasta);
    const publicaciones = await this.publicacionModel.find({
      eliminada: false,
      fechaCreacion: { $gte: rango.desde, $lte: rango.hasta },
    });

    const conteo = new Map<string, number>();

    for (const publicacion of publicaciones) {
      conteo.set(
        publicacion.usuarioId,
        (conteo.get(publicacion.usuarioId) ?? 0) + 1,
      );
    }

    const resultado = await Promise.all(
      [...conteo.entries()].map(async ([usuarioId, cantidad]) => {
        const usuario = await this.usuarioModel.findById(usuarioId);

        return {
          usuarioId,
          etiqueta: usuario
            ? `${usuario.nombre} ${usuario.apellido}`
            : 'Usuario desconocido',
          cantidad,
        };
      }),
    );

    return resultado.sort((a, b) => b.cantidad - a.cantidad);
  }

  async comentariosPorPeriodo(desde: string, hasta: string) {
    const rango = this.parsearRango(desde, hasta);
    const publicaciones = await this.publicacionModel.find({ eliminada: false });
    const conteoPorDia = new Map<string, number>();

    for (const publicacion of publicaciones) {
      for (const comentario of publicacion.comentarios ?? []) {
        const fechaComentario = new Date(comentario.fecha);

        if (fechaComentario < rango.desde || fechaComentario > rango.hasta) {
          continue;
        }

        const clave = fechaComentario.toISOString().slice(0, 10);
        conteoPorDia.set(clave, (conteoPorDia.get(clave) ?? 0) + 1);
      }
    }

    return [...conteoPorDia.entries()]
      .sort(([fechaA], [fechaB]) => fechaA.localeCompare(fechaB))
      .map(([fecha, cantidad]) => ({ fecha, cantidad }));
  }

  async comentariosPorPublicacion(desde: string, hasta: string) {
    const rango = this.parsearRango(desde, hasta);
    const publicaciones = await this.publicacionModel.find({ eliminada: false });
    const resultado: { publicacionId: string; etiqueta: string; cantidad: number }[] =
      [];

    for (const publicacion of publicaciones) {
      const cantidad = (publicacion.comentarios ?? []).filter((comentario) => {
        const fechaComentario = new Date(comentario.fecha);
        return fechaComentario >= rango.desde && fechaComentario <= rango.hasta;
      }).length;

      if (cantidad === 0) {
        continue;
      }

      resultado.push({
        publicacionId: String(publicacion._id),
        etiqueta: publicacion.titulo,
        cantidad,
      });
    }

    return resultado.sort((a, b) => b.cantidad - a.cantidad);
  }

  private parsearRango(desde: string, hasta: string): RangoFechas {
    if (!desde || !hasta) {
      throw new BadRequestException('Los parametros desde y hasta son obligatorios');
    }

    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

    if (Number.isNaN(fechaDesde.getTime()) || Number.isNaN(fechaHasta.getTime())) {
      throw new BadRequestException('Las fechas no son validas');
    }

    fechaDesde.setHours(0, 0, 0, 0);
    fechaHasta.setHours(23, 59, 59, 999);

    if (fechaDesde > fechaHasta) {
      throw new BadRequestException('La fecha desde no puede ser posterior a hasta');
    }

    return { desde: fechaDesde, hasta: fechaHasta };
  }
}
