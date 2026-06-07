import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { CloudinaryService } from '../publicaciones/cloudinary.service';
import { Usuario } from './usuario.schema';
import { UsuarioLoginDTO, UsuarioRegistroDTO } from './usuario.dto';

@Injectable()
export class AutenticacionService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async registrar(
    usuario: UsuarioRegistroDTO,
    imagenPerfil?: Express.Multer.File,
  ) {
    if (usuario.password !== usuario.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const correoExistente = await this.usuarioModel.findOne({
      correo: usuario.correo,
    });

    if (correoExistente) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const nombreUsuarioExistente = await this.usuarioModel.findOne({
      nombreUsuario: usuario.nombreUsuario,
    });

    if (nombreUsuarioExistente) {
      throw new BadRequestException('El nombre de usuario ya está registrado');
    }

    const contraseñaEncriptada = await bcrypt.hash(usuario.password, 10);

    const imagenSubida = imagenPerfil
      ? await this.cloudinaryService.subirImagen(imagenPerfil)
      : null;
    const imagenPerfilUrl = imagenSubida?.secure_url ?? '';

    const usuarioCreado = await this.usuarioModel.create({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      contraseña: contraseñaEncriptada,
      fechaNacimiento: usuario.fechaNacimiento,
      descripcion: usuario.descripcion,
      imagenPerfilUrl,
      perfil: 'usuario',
    });

    return this.sinContraseña(usuarioCreado);
  }

  async login(usuario: UsuarioLoginDTO) {
    const usuarioEncontrado = await this.usuarioModel.findOne({
      $or: [
        { correo: usuario.identifier },
        { nombreUsuario: usuario.identifier },
      ],
    });

    if (!usuarioEncontrado) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const contraseñaCorrecta = await bcrypt.compare(
      usuario.password,
      usuarioEncontrado.contraseña,
    );

    if (!contraseñaCorrecta) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    return this.sinContraseña(usuarioEncontrado);
  }

  private sinContraseña(usuario: Usuario & { toObject?: () => Record<string, unknown> }) {
    const usuarioObjeto = usuario.toObject?.() ?? { ...usuario };
    delete usuarioObjeto.contraseña;
    return usuarioObjeto;
  }
}
