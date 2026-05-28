import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  create(createPostDto: CreatePostDto) {
    return 'crear una nueva publicacion';
  }

  findAll() {
    return 'todas las publicaciones';
  }

  findOne(id: number) {
    return ` devuelve la publicacion #${id}`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `actualizar la publicacion #${id}`;
  }

  remove(id: number) {
    return `eliminar la publicacion #${id}`;
  }
}
