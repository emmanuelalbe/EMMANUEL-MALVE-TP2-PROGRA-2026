import { Routes } from '@angular/router';
import { CargandoComponent } from './pages/cargando/cargando';
import { LoginComponent } from './pages/login/login';
import { MiPerfilComponent } from './pages/mi-perfil/mi-perfil';
import { PublicacionDetalleComponent } from './pages/publicacion-detalle/publicacion-detalle';
import { PublicacionesComponent } from './pages/publicaciones/publicaciones';
import { RegistroComponent } from './pages/registro/registro';

export const routes: Routes = [
  { path: '', component: CargandoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'publicaciones', component: PublicacionesComponent },
  { path: 'publicaciones/:id', component: PublicacionDetalleComponent },
  { path: 'mi-perfil', component: MiPerfilComponent },
  { path: '**', redirectTo: '' },
];
