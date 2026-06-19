import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../autenticacion/guards/admin.guard';
import { EstadisticasService } from './estadisticas.service';

@UseGuards(AdminGuard)
@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.estadisticasService.publicacionesPorUsuario(desde, hasta);
  }

  @Get('comentarios-por-periodo')
  comentariosPorPeriodo(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.estadisticasService.comentariosPorPeriodo(desde, hasta);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.estadisticasService.comentariosPorPublicacion(desde, hasta);
  }
}
