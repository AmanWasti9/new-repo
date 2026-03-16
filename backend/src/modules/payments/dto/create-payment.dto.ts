import Joi from 'joi';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';

export class CreatePaymentDto {
  bookingId: string;
  amount?: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  transactionId?: string;
  paidAmount?: number;
}

export const CreatePaymentSchema = Joi.object({
  bookingId: Joi.string().uuid().required(),

  amount: Joi.number().precision(2).positive().optional(),

  paymentMethod: Joi.string()
    .valid(...Object.values(PaymentMethod))
    .required(),

  paymentStatus: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .optional(),

  transactionId: Joi.string().optional(),

  paidAmount: Joi.number().precision(2).positive().optional(),
});
