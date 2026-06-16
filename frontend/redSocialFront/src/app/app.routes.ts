import { Routes } from '@angular/router';
import { adminGuard } from './core/admin.guard';
import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guest.guard';
import { CargandoComponent } from './pages/cargando/cargando';
import { DashboardUsuariosComponent } from './pages/dashboard-usuarios/dashboard-usuarios';
import { LoginComponent } from './pages/login/login';
import { MiPerfilComponent } from './pages/mi-perfil/mi-perfil';
import { PublicacionDetalleComponent } from './pages/publicacion-detalle/publicacion-detalle';
import { PublicacionesComponent } from './pages/publicaciones/publicaciones';
import { RegistroComponent } from './pages/registro/registro';

export const routes: Routes = [
  { path: '', component: CargandoComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'registro', component: RegistroComponent, canActivate: [guestGuard] },
  { path: 'publicaciones', component: PublicacionesComponent, canActivate: [authGuard] },
  {
    path: 'publicaciones/:id',
    component: PublicacionDetalleComponent,
    canActivate: [authGuard],
  },
  { path: 'mi-perfil', component: MiPerfilComponent, canActivate: [authGuard] },
  {
    path: 'dashboard/usuarios',
    component: DashboardUsuariosComponent,
    canActivate: [authGuard, adminGuard],
  },
  { path: '**', redirectTo: '' },
];
