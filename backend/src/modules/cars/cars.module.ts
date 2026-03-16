import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from './entities/car.entity';
import { User } from '../users/entities/users.entity';
import { CarController } from './cars.controller';
import { CarService } from './cars.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Car, User]), CommonModule],
  controllers: [CarController],
  providers: [CarService],
  exports: [CarService],
})
export class CarsModule {}
