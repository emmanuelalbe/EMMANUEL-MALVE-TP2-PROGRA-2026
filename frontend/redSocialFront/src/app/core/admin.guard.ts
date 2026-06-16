import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';

export const adminGuard: CanActivateFn = () => {
  const autenticacionService = inject(AutenticacionService);
  const router = inject(Router);
  const usuarioActual = autenticacionService.obtenerSesion();

  if (usuarioActual?.perfil === 'administrador') {
    return true;
  }

  return router.createUrlTree(['/publicaciones']);
};
