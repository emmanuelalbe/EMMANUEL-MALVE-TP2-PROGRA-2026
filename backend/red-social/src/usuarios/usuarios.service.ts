import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { Usuario } from '../autenticacion/usuario.schema';
import { CloudinaryService } from '../publicaciones/cloudinary.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

type UsuarioConObjeto = Usuario & {
  _id: unknown;
  toObject: () => Usuario & { _id: unknown };
};

type UsuarioObjeto = Record<string, unknown> & {
  _id: unknown;
};

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createUsuarioDto: CreateUsuarioDto,
    imagenPerfil?: Express.Multer.File,
  ) {
    if (createUsuarioDto.password !== createUsuarioDto.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const correoExistente = await this.usuarioModel.findOne({
      correo: createUsuarioDto.correo,
    });

    if (correoExistente) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const nombreUsuarioExistente = await this.usuarioModel.findOne({
      nombreUsuario: createUsuarioDto.nombreUsuario,
    });

    if (nombreUsuarioExistente) {
      throw new BadRequestException('El nombre de usuario ya está registrado');
    }

    const contraseñaEncriptada = await bcrypt.hash(createUsuarioDto.password, 10);
    const imagenSubida = imagenPerfil
      ? await this.cloudinaryService.subirImagen(imagenPerfil)
      : null;
    const imagenPerfilUrl = imagenSubida?.secure_url ?? '';

    const usuarioCreado = await this.usuarioModel.create({
      nombre: createUsuarioDto.nombre,
      apellido: createUsuarioDto.apellido,
      correo: createUsuarioDto.correo,
      nombreUsuario: createUsuarioDto.nombreUsuario,
      contraseña: contraseñaEncriptada,
      fechaNacimiento: createUsuarioDto.fechaNacimiento,
      descripcion: createUsuarioDto.descripcion,
      imagenPerfilUrl,
      perfil: createUsuarioDto.perfil,
    });

    await this.usuarioModel.collection.updateOne(
      { _id: usuarioCreado._id },
      { $set: { habilitado: true } },
    );

    return this.usuarioSinContraseña(usuarioCreado as UsuarioConObjeto);
  }

  async findAll() {
    const usuarios = await this.usuarioModel.collection
      .find()
      .sort({ nombre: 1, apellido: 1 })
      .toArray();

    return usuarios.map((usuario) => this.usuarioSinContraseña(usuario));
  }

  async obtenerEstado(id: string) {
    const usuario = await this.buscarUsuarioPorId(id);

    return {
      _id: String(usuario._id),
      habilitado: usuario.habilitado !== false,
    };
  }

  async cambiarHabilitacion(id: string, habilitado: boolean) {
    const usuarioId = this.obtenerObjectId(id);
    const resultado = await this.usuarioModel.collection.updateOne(
      { _id: usuarioId },
      { $set: { habilitado } },
    );

    if (resultado.matchedCount === 0) {
      throw new NotFoundException('El usuario no existe');
    }

    const usuarioActualizado = await this.buscarUsuarioPorId(id);

    return this.usuarioSinContraseña(usuarioActualizado);
  }

  private async buscarUsuarioPorId(id: string) {
    const usuarioId = this.obtenerObjectId(id);
    const usuario = await this.usuarioModel.collection.findOne({ _id: usuarioId });

    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }

    return usuario;
  }

  private obtenerObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('El usuario no existe');
    }

    return new Types.ObjectId(id);
  }

  private usuarioSinContraseña(usuario: UsuarioConObjeto | UsuarioObjeto) {
    const usuarioConObjeto = usuario as UsuarioConObjeto;
    const usuarioObjeto =
      typeof usuarioConObjeto.toObject === 'function'
        ? (usuarioConObjeto.toObject() as unknown as UsuarioObjeto)
        : usuario;
    delete usuarioObjeto.contraseña;

    return {
      ...usuarioObjeto,
      _id: String(usuarioObjeto._id),
      habilitado: usuarioObjeto.habilitado !== false,
    };
  }
}
