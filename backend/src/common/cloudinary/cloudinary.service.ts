import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    v2.config({
      cloud_name: 'dye17qg5s',
      api_key: '556383758447947',
      api_secret: 'dJDlKSp2xmbrx1VPqyFCd7DmuCA',
    });
  }

  async uploadImage(
    filePath: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      v2.uploader.upload(
        filePath,
        { folder: 'car-rental' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else if (!result) {
            reject(new Error('No response from Cloudinary'));
          } else {
            resolve(result);
          }
        },
      );
    });
  }
}
