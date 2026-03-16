import Joi from 'joi';
import { BookingStatus } from 'src/common/enums/booking-status.enum';

export class CreateBookingDto {
  carId: string;
  startDate: Date;
  endDate: Date;
  status?: BookingStatus;
  quantity: number;
}

export const CreateBookingSchema = Joi.object({
  carId: Joi.string().uuid().required(),

  startDate: Joi.date().greater('now').required(),

  endDate: Joi.date().greater(Joi.ref('startDate')).required(),

  status: Joi.string()
    .valid(...Object.values(BookingStatus))
    .optional(),
  quantity: Joi.number().integer().min(1).required(),
});
