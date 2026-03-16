import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from '../cars/entities/car.entity';
import { User } from '../users/entities/users.entity';
import { Bookings } from './entities/booking.entity';
import { BookingController } from './bookings.controller';
import { BookingService } from './bookings.service';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bookings, User, Car, Payment])],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingsModule {}
