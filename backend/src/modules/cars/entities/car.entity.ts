import { CarStatus } from 'src/common/enums/car-status.enum';
import { FuelType } from 'src/common/enums/fule-type.enum';
import { TransmissionType } from 'src/common/enums/transmission-type.enum';
import { Bookings } from 'src/modules/bookings/entities/booking.entity';
import { User } from 'src/modules/users/entities/users.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity()
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  model: string;

  @Column()
  brand: string;

  @Column({ type: 'int', default: 1 })
  totalQuantity: number;

  @Column({ type: 'int', nullable: false })
  availableQuantity: number;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerDay: number;

  @Column({ type: 'enum', enum: CarStatus, default: CarStatus.AVAILABLE })
  carStatus: CarStatus;

  @Column({ type: 'enum', enum: FuelType })
  fuelType: FuelType;

  @Column({ type: 'enum', enum: TransmissionType })
  transmissionType: TransmissionType;

  @OneToMany(() => Bookings, (bookings) => bookings.car)
  bookings: Bookings[];

  @ManyToOne(() => User, (user) => user.cars, { onDelete: 'CASCADE' })
  owner: User;

  @BeforeInsert()
  setAvailableQuantityOnInsert() {
    if (this.availableQuantity === null || this.availableQuantity === undefined || this.availableQuantity <= 0) {
      this.availableQuantity = this.totalQuantity ?? 1;
    }
  }

  @BeforeUpdate()
  adjustAvailableQuantityOnUpdate() {
    if (this.totalQuantity !== undefined && this.totalQuantity !== null) {
      if (this.availableQuantity === null || this.availableQuantity === undefined) {
        this.availableQuantity = this.totalQuantity;
      }
      if (this.availableQuantity > this.totalQuantity) {
        this.availableQuantity = this.totalQuantity;
      }
    }
  }
}
