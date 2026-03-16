import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Car } from './entities/car.entity';
import { User } from 'src/modules/users/entities/users.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { CarStatus } from 'src/common/enums/car-status.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginate } from 'src/common/utils/pagination.util';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createCarDto: CreateCarDto, ownerId: string): Promise<Car> {
    const owner = await this.userRepository.findOne({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    const car = this.carRepository.create({
      model: createCarDto.model,
      brand: createCarDto.brand,
      pricePerDay: createCarDto.pricePerDay,
      totalQuantity: createCarDto.totalQuantity,
      availableQuantity: createCarDto.availableQuantity,
      carStatus: createCarDto.carStatus ?? CarStatus.AVAILABLE,
      fuelType: createCarDto.fuelType,
      transmissionType: createCarDto.transmissionType,
      image: createCarDto.image,
      owner,
    });

    return this.carRepository.save(car);
  }


  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const skip = (page - 1) * limit;

    const [data, total] = await this.carRepository.findAndCount({
      relations: ['owner'],
      skip,
      take: limit,
    });

    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<Car> {
    const car = await this.carRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return car;
  }

  async findByOwnerId(ownerId: string): Promise<Car[]> {
    const owner = await this.userRepository.findOne({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    const cars = await this.carRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['owner'],
    });

    return cars;
  }

  async update(
    id: string,
    updateCarDto: UpdateCarDto,
    currentUserId?: string,
  ): Promise<Car> {
    const car = await this.findOne(id);

    if (currentUserId && car.owner && car.owner.id !== currentUserId) {
      throw new ForbiddenException('Not allowed to update this car');
    }

    Object.assign(car, updateCarDto);

    return this.carRepository.save(car);
  }

  async remove(id: string): Promise<void> {
    const car = await this.findOne(id);
    await this.carRepository.remove(car);
  }
}
