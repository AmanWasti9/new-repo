import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car } from './entities/car.entity';
import { CarService } from './cars.service';
import { PayloadValidationGuard } from 'src/common/guards/payload-validation.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-guard.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { currentUser } from 'src/common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('cars')
@UseGuards(JwtAuthGuard, RolesGuard, PayloadValidationGuard)
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExt = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(new Error('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  create(
    @Body() createCarDto: CreateCarDto,
    @UploadedFile() file: Express.Multer.File,
    @currentUser() user: any,
  ) {
    if (file) {
      createCarDto.image = file.path;
    }
    return this.carService.create(createCarDto, user.id);
  }

  // @Get()
  // findAll(): Promise<Car[]> {
  //   return this.carService.findAll();
  // }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.carService.findAll(paginationDto);
  }

  @Get('owner')
  @Roles(Role.OWNER)
  findByOwner(@currentUser() user: any): Promise<Car[]> {
    return this.carService.findByOwnerId(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Car> {
    return this.carService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExt = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateCarDto: UpdateCarDto,
    @UploadedFile() file: Express.Multer.File,
    @currentUser() user: any,
  ) {
    if (file) {
      updateCarDto.image = file.path;
    }
    return this.carService.update(id, updateCarDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.carService.remove(id);
  }
}
