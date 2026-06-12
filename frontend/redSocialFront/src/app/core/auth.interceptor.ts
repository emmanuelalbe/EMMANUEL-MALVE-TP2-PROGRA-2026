import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AutenticacionService } from '../services/autenticacion.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const autenticacionService = inject(AutenticacionService);
  const router = inject(Router);
  const token = autenticacionService.obtenerToken();

  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error) => {
      if (error.status === 401) {
        autenticacionService.cerrarSesion();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
