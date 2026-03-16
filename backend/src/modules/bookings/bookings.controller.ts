import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Bookings } from './entities/booking.entity';
import { BookingService } from './bookings.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-guard.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PayloadValidationGuard } from 'src/common/guards/payload-validation.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { currentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard, PayloadValidationGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(
    @Body() createBookingDto: CreateBookingDto,
    @currentUser() user: any,
  ): Promise<Bookings> {
    return this.bookingService.create(createBookingDto, user.id);
  }

  @Get('all')
  findAllWithoutPagination(): Promise<Bookings[]> {
    return this.bookingService.findAllWithoutPagination();
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.bookingService.findAll(paginationDto);
  }

  @Get('owner/all')
  @Roles(Role.OWNER)
  findOwnerBookingsWithoutPagination(@currentUser() user: any): Promise<Bookings[]> {
    return this.bookingService.findByOwnerIdWithoutPagination(user.id);
  }

  @Get('my-bookings/all')
  findMyBookingsWithoutPagination(@currentUser() user: any): Promise<Bookings[]> {
    return this.bookingService.findByUserIdWithoutPagination(user.id);
  }

  @Get('owner')
  @Roles(Role.OWNER)
  findOwnerBookings(
    @currentUser() user: any,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.bookingService.findByOwnerId(user.id, paginationDto);
  }

  @Get('my-bookings')
  @Roles(Role.CUSTOMER)
  findMyBookings(
    @currentUser() user: any,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.bookingService.findByUserId(user.id, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Bookings> {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  updateDates(
    @Param('id') id: string,
    @Body() updateDto: UpdateBookingDto,
    @currentUser() user: any,
  ): Promise<Bookings> {
    return this.bookingService.updateDates(id, updateDto, user.id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string): Promise<Bookings> {
    return this.bookingService.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.bookingService.remove(id);
  }
}
