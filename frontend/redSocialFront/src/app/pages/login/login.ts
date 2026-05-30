import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { obtenerMensajeError } from '../../core/http-error';
import { AutenticacionService } from '../../services/autenticacion.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly router = inject(Router);
  private readonly passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  protected cargando = false;
  protected mensajeError = '';

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
    this.mensajeError = '';

    this.autenticacionService.login(this.loginForm.getRawValue()).subscribe({
      next: (usuario) => {
        this.autenticacionService.guardarSesion(usuario);
        this.cargando = false;
        this.router.navigate(['/publicaciones']);
      },
      error: (error) => {
        this.cargando = false;
        this.mensajeError = obtenerMensajeError(error);
      },
    });
  }

  protected showError(controlName: 'identifier' | 'password', error?: string): boolean {
    const control = this.loginForm.controls[controlName];
    return control.touched && (error ? control.hasError(error) : control.invalid);
  }
}
