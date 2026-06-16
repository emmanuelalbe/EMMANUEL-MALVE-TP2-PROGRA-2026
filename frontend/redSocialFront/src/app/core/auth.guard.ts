import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';

export const authGuard: CanActivateFn = () => {
  const autenticacionService = inject(AutenticacionService);
  const router = inject(Router);

  if (autenticacionService.estaAutenticado()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
