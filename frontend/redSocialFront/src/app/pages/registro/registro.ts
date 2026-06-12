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
import { AutenticacionService } from '../../services/autenticacion.service';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly sesionService = inject(SesionService);
  private readonly router = inject(Router);
  private readonly passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  protected cargando = false;
  protected mensajeError = '';
  protected imagenPerfil: File | null = null;

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

    const datos = this.registroForm.getRawValue();
    const formData = new FormData();

    formData.append('nombre', datos.nombre);
    formData.append('apellido', datos.apellido);
    formData.append('correo', datos.correo);
    formData.append('nombreUsuario', datos.nombreUsuario);
    formData.append('password', datos.password);
    formData.append('repetirPassword', datos.repetirPassword);
    formData.append('fechaNacimiento', datos.fechaNacimiento);
    formData.append('descripcion', datos.descripcion);

    if (this.imagenPerfil) {
      formData.append('imagenPerfil', this.imagenPerfil);
    }

    this.autenticacionService.registrar(formData).subscribe({
      next: (usuario) => {
        this.autenticacionService.guardarSesion(usuario);
        this.sesionService.iniciarContador();
        this.cargando = false;
        this.router.navigate(['/publicaciones']);
      },
      error: (error) => {
        this.cargando = false;
        this.mensajeError = obtenerMensajeError(error);
      },
    });
  }

  protected seleccionarImagenPerfil(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imagenPerfil = input.files?.[0] ?? null;
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
