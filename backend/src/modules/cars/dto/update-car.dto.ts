import Joi from 'joi';
import { CarStatus } from 'src/common/enums/car-status.enum';
import { FuelType } from 'src/common/enums/fule-type.enum';
import { TransmissionType } from 'src/common/enums/transmission-type.enum';

export class UpdateCarDto {
  model?: string;
  brand?: string;
  pricePerDay?: number;
  carStatus?: CarStatus;
  fuelType?: FuelType;
  transmissionType?: TransmissionType;
  image?: string;
  totalQuantity?: number;
  availableQuantity?: number;
}

export const UpdateCarSchema = Joi.object({
  model: Joi.string().optional(),
  brand: Joi.string().optional(),
  pricePerDay: Joi.number().precision(2).positive().optional(),
  carStatus: Joi.string()
    .valid(...Object.values(CarStatus))
    .optional(),
  fuelType: Joi.string()
    .valid(...Object.values(FuelType))
    .optional(),
  transmissionType: Joi.string()
    .valid(...Object.values(TransmissionType))
    .optional(),
  image: Joi.string().uri().optional(),
  totalQuantity: Joi.number().integer().positive().optional(),
  availableQuantity: Joi.number().integer().positive().optional(),
});
