import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './modules/users/entities/users.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/users.module';
import { CarsModule } from './modules/cars/cars.module';
import { Car } from './modules/cars/entities/car.entity';
import { Bookings } from './modules/bookings/entities/booking.entity';
import { BookingsModule } from './modules/bookings/bookings.module';
import { Payment } from './modules/payments/entities/payment.entity';
import { PaymentsModule } from './modules/payments/payments.module';
import { MulterModule } from '@nestjs/platform-express';
import { CommonModule } from './common/common.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'root'),
        database: configService.get<string>('DB_NAME', 'car-rental'),
        entities: [User, Car, Bookings, Payment],
        synchronize: true,
      }),
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),

    MulterModule.register({
      dest: './uploads',
    }),
    CommonModule,
    AuthModule,
    UserModule,
    CarsModule,
    BookingsModule,
    PaymentsModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
