import { BookingStatus } from 'src/common/enums/booking-status.enum';
import { Car } from 'src/modules/cars/entities/car.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { User } from 'src/modules/users/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Bookings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.bookings, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Car, (car) => car.bookings, {
    eager: true,
    onDelete: 'CASCADE',
  })
  car: Car;

  @ManyToOne(() => User, { eager: true })
  owner: User;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @OneToOne(() => Payment, (payment) => payment.booking)
  // payment: Payment;
  @OneToOne(() => Payment, (payment) => payment.booking)
  @JoinColumn()
  payment: Payment;
}
