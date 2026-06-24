import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Chart,
  ChartConfiguration,
  registerables,
} from 'chart.js';
import {
  MensajeModalComponent,
  ModalTipo,
} from '../../components/mensaje-modal/mensaje-modal';
import { obtenerMensajeError } from '../../core/http-error';
import { RangoEstadisticas } from '../../models/estadistica';
import { EstadisticasService } from '../../services/estadisticas.service';

Chart.register(...registerables);

const COLORES_GRAFICO = ['#8b5cf6', '#a78bfa', '#7c3aed', '#c4b5fd', '#6d28d9', '#ddd6fe'];

const OPCIONES_EJES_OSCUROS = {
  ticks: { color: 'rgba(255, 255, 255, 0.65)' },
  grid: { color: 'rgba(139, 92, 246, 0.15)' },
};

const OPCIONES_LEYENDA_OSCURA = {
  position: 'bottom' as const,
  labels: { color: 'rgba(255, 255, 255, 0.82)' },
};

@Component({
  selector: 'app-dashboard-estadisticas',
  imports: [FormsModule, MensajeModalComponent],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.css',
})
export class DashboardEstadisticasComponent implements AfterViewInit, OnDestroy {
  private readonly estadisticasService = inject(EstadisticasService);

  @ViewChild('graficoPublicaciones') graficoPublicacionesRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoComentariosPeriodo') graficoComentariosPeriodoRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoComentariosPublicacion') graficoComentariosPublicacionRef?: ElementRef<HTMLCanvasElement>;

  rangoPublicaciones: RangoEstadisticas = this.crearRangoPorDefecto();
  rangoComentariosPeriodo: RangoEstadisticas = this.crearRangoPorDefecto();
  rangoComentariosPublicacion: RangoEstadisticas = this.crearRangoPorDefecto();

  cargandoPublicaciones = false;
  cargandoComentariosPeriodo = false;
  cargandoComentariosPublicacion = false;

  modalVisible = false;
  modalTipo: ModalTipo = 'error';
  modalMensaje = '';

  private graficoPublicaciones?: Chart;
  private graficoComentariosPeriodo?: Chart;
  private graficoComentariosPublicacion?: Chart;
  private vistaLista = false;

  ngAfterViewInit(): void {
    this.vistaLista = true;
    this.cargarPublicacionesPorUsuario();
    this.cargarComentariosPorPeriodo();
    this.cargarComentariosPorPublicacion();
  }

  ngOnDestroy(): void {
    this.graficoPublicaciones?.destroy();
    this.graficoComentariosPeriodo?.destroy();
    this.graficoComentariosPublicacion?.destroy();
  }

  cargarPublicacionesPorUsuario(): void {
    this.cargandoPublicaciones = true;

    this.estadisticasService.publicacionesPorUsuario(this.rangoPublicaciones).subscribe({
      next: (datos) => {
        this.cargandoPublicaciones = false;
        this.renderizarPublicacionesPorUsuario(datos);
      },
      error: (error) => {
        this.cargandoPublicaciones = false;
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

  cargarComentariosPorPeriodo(): void {
    this.cargandoComentariosPeriodo = true;

    this.estadisticasService.comentariosPorPeriodo(this.rangoComentariosPeriodo).subscribe({
      next: (datos) => {
        this.cargandoComentariosPeriodo = false;
        this.renderizarComentariosPorPeriodo(datos);
      },
      error: (error) => {
        this.cargandoComentariosPeriodo = false;
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

  cargarComentariosPorPublicacion(): void {
    this.cargandoComentariosPublicacion = true;

    this.estadisticasService.comentariosPorPublicacion(this.rangoComentariosPublicacion).subscribe({
      next: (datos) => {
        this.cargandoComentariosPublicacion = false;
        this.renderizarComentariosPorPublicacion(datos);
      },
      error: (error) => {
        this.cargandoComentariosPublicacion = false;
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

  cerrarModal(): void {
    this.modalVisible = false;
  }

  private renderizarPublicacionesPorUsuario(
    datos: { etiqueta: string; cantidad: number }[],
  ): void {
    const canvas = this.graficoPublicacionesRef?.nativeElement;

    if (!canvas || !this.vistaLista) {
      return;
    }

    this.graficoPublicaciones?.destroy();

    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: datos.length > 0 ? datos.map((item) => item.etiqueta) : ['Sin datos'],
        datasets: [
          {
            data: datos.length > 0 ? datos.map((item) => item.cantidad) : [1],
            backgroundColor: COLORES_GRAFICO,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: OPCIONES_LEYENDA_OSCURA,
        },
      },
    };

    this.graficoPublicaciones = new Chart(canvas, config);
  }

  private renderizarComentariosPorPeriodo(
    datos: { fecha: string; cantidad: number }[],
  ): void {
    const canvas = this.graficoComentariosPeriodoRef?.nativeElement;

    if (!canvas || !this.vistaLista) {
      return;
    }

    this.graficoComentariosPeriodo?.destroy();

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: datos.length > 0 ? datos.map((item) => item.fecha) : ['Sin datos'],
        datasets: [
          {
            label: 'Comentarios',
            data: datos.length > 0 ? datos.map((item) => item.cantidad) : [0],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: OPCIONES_LEYENDA_OSCURA,
        },
        scales: {
          x: OPCIONES_EJES_OSCUROS,
          y: {
            ...OPCIONES_EJES_OSCUROS,
            beginAtZero: true,
            ticks: { ...OPCIONES_EJES_OSCUROS.ticks, stepSize: 1 },
          },
        },
      },
    };

    this.graficoComentariosPeriodo = new Chart(canvas, config);
  }

  private renderizarComentariosPorPublicacion(
    datos: { etiqueta: string; cantidad: number }[],
  ): void {
    const canvas = this.graficoComentariosPublicacionRef?.nativeElement;

    if (!canvas || !this.vistaLista) {
      return;
    }

    this.graficoComentariosPublicacion?.destroy();

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: datos.length > 0 ? datos.map((item) => item.etiqueta) : ['Sin datos'],
        datasets: [
          {
            label: 'Comentarios',
            data: datos.length > 0 ? datos.map((item) => item.cantidad) : [0],
            backgroundColor: '#7c3aed',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: OPCIONES_LEYENDA_OSCURA,
        },
        scales: {
          x: OPCIONES_EJES_OSCUROS,
          y: {
            ...OPCIONES_EJES_OSCUROS,
            beginAtZero: true,
            ticks: { ...OPCIONES_EJES_OSCUROS.ticks, stepSize: 1 },
          },
        },
      },
    };

    this.graficoComentariosPublicacion = new Chart(canvas, config);
  }

  private crearRangoPorDefecto(): RangoEstadisticas {
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(desde.getDate() - 30);

    return {
      desde: desde.toISOString().slice(0, 10),
      hasta: hasta.toISOString().slice(0, 10),
    };
  }

  private mostrarModal(tipo: ModalTipo, mensaje: string): void {
    this.modalTipo = tipo;
    this.modalMensaje = mensaje;
    this.modalVisible = true;
  }
}
