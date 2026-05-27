import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  create(createUsuarioDto: CreateUsuarioDto) {
    return 'Esta accion crea un nuevo usuario';
  }

  findAll() {
    return 'todos los usuarios';
  }

  findOne(id: number) {
    return `usuario #${id}`;
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return ` actualizar el usuario #${id}`;
  }

  remove(id: number) {
    return `elimina el usuario #${id}`;
  }
}
