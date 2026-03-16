import { Exclude } from 'class-transformer';
import { Role } from 'src/common/enums/roles.enum';
import { Bookings } from 'src/modules/bookings/entities/booking.entity';
import { Car } from 'src/modules/cars/entities/car.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role: Role;

  @OneToMany(() => Bookings, (bookings) => bookings.user)
  bookings: Bookings[];

  @OneToMany(() => Car, (car) => car.owner)
  cars: Car[];
}
