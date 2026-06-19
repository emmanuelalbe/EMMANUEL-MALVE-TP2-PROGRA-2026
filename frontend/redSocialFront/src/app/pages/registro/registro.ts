import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  MensajeModalComponent,
  ModalTipo,
} from '../../components/mensaje-modal/mensaje-modal';
import { obtenerMensajeError } from '../../core/http-error';
import { AutenticacionService } from '../../services/autenticacion.service';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-registro',
  imports: [MensajeModalComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly sesionService = inject(SesionService);
  private readonly router = inject(Router);
  private readonly passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

cargando = false;
modalVisible = false;
modalTipo: ModalTipo = 'error';
modalMensaje = '';
imagenPerfil: File | null = null;
  private redirigirTrasCerrar = false;

readonly registroForm = this.formBuilder.nonNullable.group(
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

onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.cargando = true;

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
        this.mostrarModal('exito', 'Cuenta creada correctamente.', true);
      },
      error: (error) => {
        this.cargando = false;
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

cerrarModal(): void {
    this.modalVisible = false;

    if (this.redirigirTrasCerrar) {
      this.redirigirTrasCerrar = false;
      this.router.navigate(['/publicaciones']);
    }
  }

seleccionarImagenPerfil(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imagenPerfil = input.files?.[0] ?? null;
  }

showError(
    controlName: keyof typeof this.registroForm.controls,
    error?: string,
  ): boolean {
    const control = this.registroForm.controls[controlName];
    return control.touched && (error ? control.hasError(error) : control.invalid);
  }

passwordsMismatch(): boolean {
    return (
      this.registroForm.controls.repetirPassword.touched &&
      this.registroForm.hasError('passwordMismatch')
    );
  }

  private mostrarModal(tipo: ModalTipo, mensaje: string, redirigir = false): void {
    this.modalTipo = tipo;
    this.modalMensaje = mensaje;
    this.redirigirTrasCerrar = redirigir;
    this.modalVisible = true;
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const repetirPassword = control.get('repetirPassword')?.value;

    return password && repetirPassword && password !== repetirPassword
      ? { passwordMismatch: true }
      : null;
  }
}
