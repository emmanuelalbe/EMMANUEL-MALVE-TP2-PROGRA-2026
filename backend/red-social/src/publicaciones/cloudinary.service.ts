import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async subirImagen(imagen: Express.Multer.File): Promise<UploadApiResponse> {
    const imagenBase64 = imagen.buffer.toString('base64');
    const dataUri = `data:${imagen.mimetype};base64,${imagenBase64}`;

    try {
      return await cloudinary.uploader.upload(dataUri, {
        folder: 'publicaciones',
      });
    } catch {
      throw new BadRequestException('No se pudo subir la imagen');
    }
  }
}
