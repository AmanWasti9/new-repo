import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Bookings } from '../bookings/entities/booking.entity';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { BookingStatus } from 'src/common/enums/booking-status.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Bookings)
    private readonly bookingRepository: Repository<Bookings>,
  ) { }



  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { bookingId, paymentMethod, paidAmount } = createPaymentDto;

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['payment', 'user', 'car', 'owner'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.payment) {
      throw new BadRequestException('Payment already exists for this booking');
    }

    const totalAmount = booking.totalPrice;
    const userPaidAmount = paidAmount ?? 0;

    if (userPaidAmount > totalAmount) {
      throw new BadRequestException('Paid amount cannot exceed total amount');
    }

    const remainingAmount = totalAmount - userPaidAmount;

    let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
    if (paymentMethod === 'CARD' && remainingAmount === 0) {
      paymentStatus = PaymentStatus.SUCCESS;
    }

    const payment = this.paymentRepository.create({
      booking,
      amount: totalAmount,
      paidAmount: userPaidAmount,
      remainingAmount,
      paymentMethod,
      paymentStatus,
      paidAt: userPaidAmount > 0 ? new Date() : undefined,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Update booking
    if (paymentMethod === 'CASH' || paymentMethod === 'CARD') {
      booking.status = BookingStatus.CONFIRMED;
      booking.payment = savedPayment;
      await this.bookingRepository.save(booking);
    }

    // Reload booking with payment relation
    const updatedBooking = await this.bookingRepository.findOne({
      where: { id: booking.id },
      relations: ['payment', 'user', 'car', 'owner'],
    });

    savedPayment.booking = updatedBooking!;

    return savedPayment;
  }

  async markPaymentSuccess(
    paymentId: string,
    transactionId: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .where('payment.id = :id', { id: paymentId })
      .getOne();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.paymentStatus === PaymentStatus.SUCCESS) {
      throw new BadRequestException('Payment already completed');
    }

    payment.paymentStatus = PaymentStatus.SUCCESS;
    payment.transactionId = transactionId;
    payment.paidAt = new Date();

    // Update booking status if associated booking exists
    if (payment.booking) {
      payment.booking.status = BookingStatus.CONFIRMED;
      await this.bookingRepository.save(payment.booking);
    }

    return await this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: ['booking'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async findByOwnerId(ownerId: string): Promise<Payment[]> {
    return this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.car', 'car')
      .leftJoinAndSelect('booking.owner', 'owner')
      .where('owner.id = :ownerId', { ownerId })
      .orderBy('payment.createdAt', 'DESC')
      .getMany();
  }
}