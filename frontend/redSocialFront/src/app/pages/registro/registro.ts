import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { obtenerMensajeError } from '../../core/http-error';
import { RegistroRequest } from '../../models/usuario';
import { AutenticacionService } from '../../services/autenticacion.service';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly router = inject(Router);
  private readonly passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  protected cargando = false;
  protected mensajeError = '';

  protected readonly registroForm = this.formBuilder.nonNullable.group(
    {
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
      repetirPassword: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      descripcion: ['', Validators.required],
    },
    { validators: this.passwordsMatchValidator },
  );

  protected onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    const datos: RegistroRequest = this.registroForm.getRawValue();

    this.autenticacionService.registrar(datos).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.cargando = false;
        this.mensajeError = obtenerMensajeError(error);
      },
    });
  }

  protected hasRequiredErrors(): boolean {
    return Object.values(this.registroForm.controls).some(
      (control) => control.touched && control.hasError('required'),
    );
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const repetirPassword = control.get('repetirPassword')?.value;

    return password && repetirPassword && password !== repetirPassword
      ? { passwordMismatch: true }
      : null;
  }
}
