import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { MiPerfilComponent } from './pages/mi-perfil/mi-perfil';
import { PublicacionesComponent } from './pages/publicaciones/publicaciones';
import { RegistroComponent } from './pages/registro/registro';

export const routes: Routes = [
  { path: '', redirectTo: 'publicaciones', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'publicaciones', component: PublicacionesComponent },
  { path: 'mi-perfil', component: MiPerfilComponent },
  { path: '**', redirectTo: 'publicaciones' }
];
