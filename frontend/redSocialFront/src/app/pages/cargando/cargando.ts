import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-cargando',
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})
export class CargandoComponent implements OnInit {
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly sesionService = inject(SesionService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const token = this.autenticacionService.obtenerToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.autenticacionService.autorizar().subscribe({
      next: (usuario) => {
        this.autenticacionService.guardarSesion({ ...usuario, token });
        this.sesionService.iniciarContador();
        this.router.navigate(['/publicaciones']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
