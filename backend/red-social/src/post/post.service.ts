import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  create(createPostDto: CreatePostDto) {
    return 'Esta accion crea una nueva publicacion';
  }

  findAll() {
    return 'Esta accion devuelve todas las publicaciones';
  }

  findOne(id: number) {
    return `Esta accion devuelve la publicacion #${id}`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `Esta accion actualiza la publicacion #${id}`;
  }

  remove(id: number) {
    return `Esta accion elimina la publicacion #${id}`;
  }
}
