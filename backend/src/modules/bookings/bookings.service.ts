import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { Bookings } from './entities/booking.entity';
import { User } from '../users/entities/users.entity';
import { Car } from '../cars/entities/car.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from 'src/common/enums/booking-status.enum';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { Payment } from '../payments/entities/payment.entity';
import { paginate } from 'src/common/utils/pagination.util';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Bookings)
    private readonly bookingRepository: Repository<Bookings>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
    currentUserId: string,
  ): Promise<Bookings> {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (!user) throw new NotFoundException('User not found');

    const car = await this.carRepository.findOne({
      relations: ['owner'],
      where: { id: createBookingDto.carId },
    });
    if (!car) throw new NotFoundException('Car not found');

    if (createBookingDto.quantity <= 0)
      throw new BadRequestException('Quantity must be at least 1');

    // Check total booked quantity in overlapping dates
    const overlappingBookings = await this.bookingRepository.find({
      where: {
        car: { id: car.id },
        startDate: Between(
          new Date(createBookingDto.startDate),
          new Date(createBookingDto.endDate),
        ),
      },
    });

    const totalBookedQuantity = overlappingBookings.reduce(
      (sum, b) => sum + b.quantity,
      0,
    );

    // Use availableQuantity instead of total quantity
    if (
      car.availableQuantity - totalBookedQuantity <
      createBookingDto.quantity
    ) {
      throw new BadRequestException(
        'Not enough cars available for selected dates',
      );
    }

    const start = new Date(createBookingDto.startDate);
    const end = new Date(createBookingDto.endDate);
    const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (days <= 0) throw new BadRequestException('Invalid booking dates');

    const totalPrice =
      days * Number(car.pricePerDay) * createBookingDto.quantity;

    const booking = this.bookingRepository.create({
      user,
      car,
      owner: car.owner,
      startDate: createBookingDto.startDate,
      endDate: createBookingDto.endDate,
      quantity: createBookingDto.quantity,
      status: createBookingDto.status ?? BookingStatus.PENDING,
      totalPrice,
    });

    // Deduct only from availableQuantity
    car.availableQuantity -= createBookingDto.quantity;
    await this.carRepository.save(car);

    return await this.bookingRepository.save(booking);
  }

  async updateDates(
    id: string,
    updateDto: UpdateBookingDto,
    currentUserId: string,
  ): Promise<Bookings> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['car', 'user'],
    });
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.user.id !== currentUserId)
      throw new BadRequestException('You can only update your own booking');

    const newStartDate = updateDto.startDate
      ? new Date(updateDto.startDate)
      : new Date(booking.startDate);

    const newEndDate = updateDto.endDate
      ? new Date(updateDto.endDate)
      : new Date(booking.endDate);

    const newQuantity =
      updateDto.quantity !== undefined ? updateDto.quantity : booking.quantity;

    if (newQuantity <= 0)
      throw new BadRequestException('Quantity must be at least 1');

    const days =
      (newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24);
    if (days <= 0) throw new BadRequestException('Invalid booking dates');

    // 1 Get all overlapping bookings excluding current
    const overlappingBookings = await this.bookingRepository.find({
      where: {
        car: { id: booking.car.id },
        startDate: Between(newStartDate, newEndDate),
      },
    });

    const totalBookedQuantity = overlappingBookings
      .filter((b) => b.id !== booking.id)
      .reduce((sum, b) => sum + b.quantity, 0);

    //  Check against availableQuantity, not total quantity
    if (
      totalBookedQuantity + newQuantity >
      booking.car.availableQuantity + booking.quantity
    ) {
      throw new BadRequestException(
        'Not enough cars available for selected dates',
      );
    }

    // Adjust availableQuantity
    const quantityDifference = newQuantity - booking.quantity;
    booking.car.availableQuantity -= quantityDifference;
    await this.carRepository.save(booking.car);

    booking.startDate = newStartDate;
    booking.endDate = newEndDate;
    booking.quantity = newQuantity;
    booking.totalPrice = days * Number(booking.car.pricePerDay) * newQuantity;

    return await this.bookingRepository.save(booking);
  }

  

  async findAllWithoutPagination(): Promise<Bookings[]> {
    return this.bookingRepository.find({
      relations: ['car', 'user', 'owner', 'payment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.bookingRepository.findAndCount({
      relations: ['car', 'user', 'owner', 'payment'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return paginate(data, total, page, limit);
  }

  async findByOwnerIdWithoutPagination(ownerId: string): Promise<Bookings[]> {
    return this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.car', 'car')
      .leftJoinAndSelect('booking.payment', 'payment')
      .leftJoinAndSelect('booking.owner', 'owner')
      .where('owner.id = :ownerId', { ownerId })
      .orderBy('booking.createdAt', 'DESC')
      .getMany();
  }

  async findByOwnerId(ownerId: string, paginationDto: PaginationDto) {
  const { page = 1, limit = 10 } = paginationDto;
  const skip = (page - 1) * limit;

  const [data, total] = await this.bookingRepository
    .createQueryBuilder('booking')
    .leftJoinAndSelect('booking.user', 'user')
    .leftJoinAndSelect('booking.car', 'car')
    .leftJoinAndSelect('booking.payment', 'payment')
    .leftJoinAndSelect('booking.owner', 'owner')
    .where('owner.id = :ownerId', { ownerId })
    .orderBy('booking.createdAt', 'DESC')
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return paginate(data, total, page, limit);
}

  async findByUserIdWithoutPagination(userId: string): Promise<Bookings[]> {
    return this.bookingRepository.find({
      where: { user: { id: userId } },
      relations: ['car', 'owner', 'payment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string, paginationDto: PaginationDto) {
  const { page = 1, limit = 10 } = paginationDto;

  const skip = (page - 1) * limit;

  const [data, total] = await this.bookingRepository.findAndCount({
    where: { user: { id: userId } },
    relations: ['car', 'owner', 'payment'],
    order: { createdAt: 'DESC' },
    skip,
    take: limit,
  });

  return paginate(data, total, page, limit);
}

  async findOne(id: string): Promise<Bookings> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async cancel(id: string): Promise<Bookings> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['car', 'payment'],
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === BookingStatus.CANCELLED)
      throw new BadRequestException('Booking already cancelled');

    // refund logic
    if (booking.payment) {
      booking.payment.paidAmount = 0;
      booking.payment.remainingAmount = 0;
      booking.payment.paymentStatus = PaymentStatus.REFUNDED;
      await this.paymentRepository.save(booking.payment);
    }

    booking.status = BookingStatus.CANCELLED;

    booking.car.availableQuantity += booking.quantity;
    await this.carRepository.save(booking.car);

    return await this.bookingRepository.save(booking);
  }

  async remove(id: string): Promise<void> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['car', 'payment'],
    });

    if (!booking) throw new NotFoundException('Booking not found');

    // refund payment before deletion
    if (booking.payment) {
      booking.payment.paidAmount = 0;
      booking.payment.remainingAmount = Number(booking.totalPrice) || 0;
      booking.payment.paymentStatus = PaymentStatus.REFUNDED;
      await this.paymentRepository.save(booking.payment);
    }

    booking.car.availableQuantity += booking.quantity;
    await this.carRepository.save(booking.car);

    await this.bookingRepository.remove(booking);
  }
}
