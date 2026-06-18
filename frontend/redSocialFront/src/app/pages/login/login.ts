import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  MensajeModalComponent,
  ModalTipo,
} from '../../components/mensaje-modal/mensaje-modal';
import { obtenerMensajeError } from '../../core/http-error';
import { AutenticacionService } from '../../services/autenticacion.service';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-login',
  imports: [MensajeModalComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  
  private readonly formBuilder = inject(FormBuilder);

  private readonly autenticacionService = inject(AutenticacionService);
  private readonly sesionService = inject(SesionService);
  private readonly router = inject(Router);
  private readonly passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  protected cargando = false;
  protected modalVisible = false;
  protected modalTipo: ModalTipo = 'error';
  protected modalMensaje = '';
  private redirigirTrasCerrar = false;

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;

    this.autenticacionService.login(this.loginForm.getRawValue()).subscribe({
      next: (usuario) => {
        this.autenticacionService.guardarSesion(usuario);
        this.sesionService.iniciarContador();
        this.cargando = false;
        this.mostrarModal('exito', 'Inicio de sesion exitoso.', true);
      },
      error: (error) => {
        this.cargando = false;
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

  protected cerrarModal(): void {
    this.modalVisible = false;

    if (this.redirigirTrasCerrar) {
      this.redirigirTrasCerrar = false;
      this.router.navigate(['/publicaciones']);
    }
  }

  private mostrarModal(tipo: ModalTipo, mensaje: string, redirigir = false): void {
    this.modalTipo = tipo;
    this.modalMensaje = mensaje;
    this.redirigirTrasCerrar = redirigir;
    this.modalVisible = true;
  }

  protected showError(controlName: 'identifier' | 'password', error?: string): boolean {
    const control = this.loginForm.controls[controlName];
    return control.touched && (error ? control.hasError(error) : control.invalid);
  }
}
