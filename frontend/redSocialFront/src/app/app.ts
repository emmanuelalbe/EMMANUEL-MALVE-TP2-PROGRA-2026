import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AutenticacionService } from './services/autenticacion.service';
import { SesionService } from './services/sesion.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
readonly autenticacionService = inject(AutenticacionService);
readonly sesionService = inject(SesionService);
  private readonly router = inject(Router);

get estaAutenticado(): boolean {
    return this.autenticacionService.estaAutenticado();
  }

get esAdministrador(): boolean {
    return this.autenticacionService.obtenerSesion()?.perfil === 'administrador';
  }

extenderSesion(): void {
    this.sesionService.extenderSesion();
  }

noRenovarSesion(): void {
    this.sesionService.rechazarExtension();
  }

cerrarSesion(): void {
    this.autenticacionService.cerrarSesion();
    this.sesionService.detenerContador();
    this.router.navigate(['/login']);
  }
}
