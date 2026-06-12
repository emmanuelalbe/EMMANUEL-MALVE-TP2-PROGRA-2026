export interface Usuario {
  _id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenPerfilUrl?: string;
  perfil: string;
  token?: string;
}

export interface RefrescarResponse {
  token: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  password: string;
  repetirPassword: string;
  fechaNacimiento: string;
  descripcion: string;
}
