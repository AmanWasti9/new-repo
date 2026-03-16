import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { v2 as Cloudinary } from 'cloudinary';

const cloudinaryProvider = {
	provide: 'CLOUDINARY',
	useValue: Cloudinary,
};

@Module({
	providers: [CloudinaryService, cloudinaryProvider],
	exports: [CloudinaryService, cloudinaryProvider],
})
export class CommonModule {}
