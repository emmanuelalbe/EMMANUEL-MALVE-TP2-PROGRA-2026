import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from '../autenticacion/usuario.schema';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { EliminarPublicacionDto } from './dto/eliminar-publicacion.dto';
import { MeGustaDto } from './dto/me-gusta.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import {
  ComentarioPublicacion,
  Publicacion,
} from './entities/publicacion.entity';
import { CloudinaryService } from './cloudinary.service';

type DocumentoConObjeto<T> = T & {
  _id: unknown;
  toObject: () => T & { _id: unknown };
};

type ComentarioConId = ComentarioPublicacion & {
  _id: unknown;
};

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createPublicacionDto: CreatePublicacionDto,
    imagen?: Express.Multer.File,
  ) {
    const usuario = await this.usuarioModel.findById(createPublicacionDto.usuarioId);

    if (!usuario) {
      throw new BadRequestException('El usuario no existe');
    }

    const imagenSubida = imagen
      ? await this.cloudinaryService.subirImagen(imagen)
      : null;
    const imagenUrl = imagenSubida?.secure_url ?? createPublicacionDto.imagenUrl ?? '';

    const publicacionCreada = await this.publicacionModel.create({
      titulo: createPublicacionDto.titulo,
      descripcion: createPublicacionDto.descripcion,
      imagenUrl,
      usuarioId: createPublicacionDto.usuarioId,
    });

    return this.formatearPublicacion(
      publicacionCreada as DocumentoConObjeto<Publicacion>,
    );
  }

  async findAll(
    orden = 'fecha',
    offset = '0',
    limit = '5',
    usuarioId?: string,
  ) {
    const filtro: { eliminada: boolean; usuarioId?: string } = {
      eliminada: false,
    };

    if (usuarioId) {
      filtro.usuarioId = usuarioId;
    }

    const desde = Math.max(Number(offset) || 0, 0);
    const cantidad = Math.min(Math.max(Number(limit) || 5, 1), 20);
    const publicaciones = await this.publicacionModel
      .find(filtro)
      .sort({ fechaCreacion: -1 });

    const publicacionesOrdenadas =
      orden === 'likes'
        ? publicaciones.sort(
            (a, b) => b.usuariosMeGusta.length - a.usuariosMeGusta.length,
          )
        : publicaciones;

    return Promise.all(
      publicacionesOrdenadas
        .slice(desde, desde + cantidad)
        .map((publicacion) =>
          this.formatearPublicacion(publicacion as DocumentoConObjeto<Publicacion>),
        ),
    );
  }

  async findOne(id: string) {
    const publicacion = await this.buscarPublicacion(id);
    return this.formatearPublicacion(publicacion);
  }

  async remove(id: string, datos: EliminarPublicacionDto) {
    const publicacion = await this.buscarPublicacion(id);

    if (
      publicacion.usuarioId !== datos.usuarioId &&
      datos.perfil !== 'administrador'
    ) {
      throw new ForbiddenException('No podes eliminar esta publicacion');
    }

    publicacion.eliminada = true;
    await this.publicacionModel.findByIdAndUpdate(id, { eliminada: true });

    return { mensaje: 'Publicacion eliminada' };
  }

  async darMeGusta(id: string, datos: MeGustaDto) {
    const publicacion = await this.buscarPublicacion(id);

    if (publicacion.usuariosMeGusta.includes(datos.usuarioId)) {
      throw new BadRequestException('El usuario ya dio me gusta');
    }

    publicacion.usuariosMeGusta.push(datos.usuarioId);
    await this.publicacionModel.findByIdAndUpdate(id, {
      usuariosMeGusta: publicacion.usuariosMeGusta,
    });

    return this.findOne(id);
  }

  async quitarMeGusta(id: string, datos: MeGustaDto) {
    const publicacion = await this.buscarPublicacion(id);

    if (!publicacion.usuariosMeGusta.includes(datos.usuarioId)) {
      throw new BadRequestException('El usuario no habia dado me gusta');
    }

    const usuariosMeGusta = publicacion.usuariosMeGusta.filter(
      (usuarioId) => usuarioId !== datos.usuarioId,
    );

    await this.publicacionModel.findByIdAndUpdate(id, { usuariosMeGusta });

    return this.findOne(id);
  }

  async comentar(id: string, datos: CreateComentarioDto) {
    const publicacion = await this.buscarPublicacion(id);
    const usuario = await this.usuarioModel.findById(datos.usuarioId);

    if (!usuario) {
      throw new BadRequestException('El usuario no existe');
    }

    publicacion.comentarios = publicacion.comentarios ?? [];
    publicacion.comentarios.push({
      texto: datos.texto,
      usuarioId: datos.usuarioId,
      fecha: new Date(),
      modificado: false,
    });

    await this.publicacionModel.findByIdAndUpdate(id, {
      comentarios: publicacion.comentarios,
    });

    return this.findOne(id);
  }

  async listarComentarios(id: string, offset = '0', limit = '5') {
    const publicacion = await this.buscarPublicacion(id);
    const desde = Math.max(Number(offset) || 0, 0);
    const cantidad = Math.min(Math.max(Number(limit) || 5, 1), 20);
    const comentarios = [...(publicacion.comentarios ?? [])].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );

    return Promise.all(
      comentarios
        .slice(desde, desde + cantidad)
        .map((comentario) =>
          this.formatearComentario(comentario as ComentarioConId),
        ),
    );
  }

  async modificarComentario(
    id: string,
    comentarioId: string,
    datos: UpdateComentarioDto,
  ) {
    const publicacion = await this.buscarPublicacion(id);
    const comentarios = publicacion.comentarios ?? [];
    const comentario = comentarios.find(
      (item) => String(item._id) === comentarioId,
    );

    if (!comentario) {
      throw new NotFoundException('El comentario no existe');
    }

    if (comentario.usuarioId !== datos.usuarioId) {
      throw new ForbiddenException('No podes modificar este comentario');
    }

    comentario.texto = datos.texto;
    comentario.modificado = true;

    await this.publicacionModel.findByIdAndUpdate(id, { comentarios });

    return this.formatearComentario(comentario as ComentarioConId);
  }

  private async buscarPublicacion(id: string) {
    const publicacion = await this.publicacionModel.findById(id);

    if (!publicacion || publicacion.eliminada) {
      throw new NotFoundException('La publicacion no existe');
    }

    return publicacion as DocumentoConObjeto<Publicacion>;
  }

  private async formatearPublicacion(publicacion: DocumentoConObjeto<Publicacion>) {
    const publicacionObjeto = publicacion.toObject();
    const usuario = await this.usuarioModel.findById(publicacionObjeto.usuarioId);
    const comentarios = await Promise.all(
      (publicacionObjeto.comentarios ?? [])
        .sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        )
        .map((comentario) =>
          this.formatearComentario(comentario as ComentarioConId),
        ),
    );

    return {
      _id: String(publicacionObjeto._id),
      titulo: publicacionObjeto.titulo,
      descripcion: publicacionObjeto.descripcion,
      imagenUrl: publicacionObjeto.imagenUrl,
      fechaCreacion: publicacionObjeto.fechaCreacion,
      usuario: usuario
        ? this.usuarioSinContraseña(usuario as DocumentoConObjeto<Usuario>)
        : this.usuarioNoEncontrado(publicacionObjeto.usuarioId),
      cantidadMeGusta: publicacionObjeto.usuariosMeGusta.length,
      usuariosMeGusta: publicacionObjeto.usuariosMeGusta,
      comentarios,
    };
  }

  private async formatearComentario(comentario: ComentarioConId) {
    const usuario = await this.usuarioModel.findById(comentario.usuarioId);

    return {
      _id: String(comentario._id),
      texto: comentario.texto,
      fecha: comentario.fecha,
      modificado: comentario.modificado ?? false,
      usuario: usuario
        ? this.usuarioSinContraseña(usuario as DocumentoConObjeto<Usuario>)
        : this.usuarioNoEncontrado(comentario.usuarioId),
    };
  }

  private usuarioSinContraseña(usuario: DocumentoConObjeto<Usuario>) {
    const usuarioObjeto = usuario.toObject() as unknown as Record<string, unknown>;
    delete usuarioObjeto.contraseña;

    return {
      ...usuarioObjeto,
      _id: String(usuarioObjeto._id),
    };
  }

  private usuarioNoEncontrado(usuarioId: string) {
    return {
      _id: usuarioId,
      nombre: 'Usuario',
      apellido: 'eliminado',
      correo: '',
      nombreUsuario: 'usuario-eliminado',
      fechaNacimiento: '',
      descripcion: '',
      imagenPerfilUrl: '',
      perfil: 'usuario',
    };
  }
}
