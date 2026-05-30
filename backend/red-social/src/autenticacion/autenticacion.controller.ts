import { Body, Controller, Post } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { UsuarioLoginDTO, UsuarioRegistroDTO } from './usuario.dto';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('/registro')
  registrar(@Body() usuario: UsuarioRegistroDTO) {
    return this.autenticacionService.registrar(usuario);
  }

  @Post('/login')
  login(@Body() usuario: UsuarioLoginDTO) {
    return this.autenticacionService.login(usuario);
  }
}
