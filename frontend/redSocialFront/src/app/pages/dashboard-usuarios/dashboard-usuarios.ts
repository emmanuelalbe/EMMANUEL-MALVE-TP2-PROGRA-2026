import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { obtenerMensajeError } from '../../core/http-error';
import {
  MensajeModalComponent,
  ModalTipo,
} from '../../components/mensaje-modal/mensaje-modal';
import { PerfilUsuario, Usuario } from '../../models/usuario';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-dashboard-usuarios',
  imports: [DatePipe, MensajeModalComponent, ReactiveFormsModule],
  templateUrl: './dashboard-usuarios.html',
  styleUrl: './dashboard-usuarios.css',
})
export class DashboardUsuariosComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);
  private readonly passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

usuarios: Usuario[] = [];
cargando = false;
creando = false;
modalVisible = false;
modalTipo: ModalTipo = 'error';
modalMensaje = '';
imagenPerfil: File | null = null;

readonly usuarioForm = this.formBuilder.nonNullable.group(
    {
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
      repetirPassword: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      descripcion: ['', Validators.required],
      perfil: ['usuario' as PerfilUsuario, Validators.required],
    },
    { validators: this.passwordsMatchValidator },
  );

  ngOnInit(): void {
    this.cargarUsuarios();
  }

crearUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.creando = true;

    const datos = this.usuarioForm.getRawValue();
    const formData = new FormData();

    formData.append('nombre', datos.nombre);
    formData.append('apellido', datos.apellido);
    formData.append('correo', datos.correo);
    formData.append('nombreUsuario', datos.nombreUsuario);
    formData.append('password', datos.password);
    formData.append('repetirPassword', datos.repetirPassword);
    formData.append('fechaNacimiento', datos.fechaNacimiento);
    formData.append('descripcion', datos.descripcion);
    formData.append('perfil', datos.perfil);

    if (this.imagenPerfil) {
      formData.append('imagenPerfil', this.imagenPerfil);
    }

    this.usuariosService.crear(formData).subscribe({
      next: (usuario) => {
        this.usuarios = [...this.usuarios, usuario].sort((a, b) =>
          a.nombre.localeCompare(b.nombre),
        );
        this.usuarioForm.reset({ perfil: 'usuario' });
        this.imagenPerfil = null;
        this.creando = false;
        this.mostrarModal('exito', 'Usuario creado correctamente.');
      },
      error: (error) => {
        this.creando = false;
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

seleccionarImagenPerfil(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imagenPerfil = input.files?.[0] ?? null;
  }

cerrarModal(): void {
    this.modalVisible = false;
  }

showError(
    controlName: keyof typeof this.usuarioForm.controls,
    error?: string,
  ): boolean {
    const control = this.usuarioForm.controls[controlName];
    return control.touched && (error ? control.hasError(error) : control.invalid);
  }

passwordsMismatch(): boolean {
    return (
      this.usuarioForm.controls.repetirPassword.touched &&
      this.usuarioForm.hasError('passwordMismatch')
    );
  }

estaHabilitado(usuario: Usuario): boolean {
    return usuario.habilitado !== false;
  }

cambiarHabilitacion(usuario: Usuario): void {
    if (!usuario._id) {
      return;
    }

    const habilitado = this.estaHabilitado(usuario);
    const accion = habilitado ? 'deshabilitar' : 'habilitar';
    const confirmar = window.confirm(
      `Estas seguro de ${accion} a ${usuario.nombreUsuario}?`,
    );

    if (!confirmar) {
      return;
    }

    const request = habilitado
      ? this.usuariosService.deshabilitar(usuario._id)
      : this.usuariosService.rehabilitar(usuario._id);

    request.subscribe({
      next: (usuarioActualizado) => {
        this.usuarios = this.usuarios.map((item) =>
          item._id === usuarioActualizado._id ? usuarioActualizado : item,
        );
        this.mostrarModal(
          'exito',
          habilitado
            ? 'Usuario deshabilitado correctamente.'
            : 'Usuario habilitado correctamente.',
        );
      },
      error: (error) => {
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

  private cargarUsuarios(): void {
    this.cargando = true;

    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.cargando = false;
        this.usuarios = Array.isArray(usuarios) ? usuarios : [];
      },
      error: (error) => {
        this.cargando = false;
        this.usuarios = [];
        this.mostrarModal('error', obtenerMensajeError(error));
      },
    });
  }

  private mostrarModal(tipo: ModalTipo, mensaje: string): void {
    this.modalTipo = tipo;
    this.modalMensaje = mensaje;
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
