import Joi from "joi";
import { CarStatus } from "src/common/enums/car-status.enum";
import { FuelType } from "src/common/enums/fule-type.enum";
import { TransmissionType } from "src/common/enums/transmission-type.enum";

export class CreateCarDto {
  model: string;
  brand: string;
  pricePerDay: number;
  carStatus?: CarStatus;
  fuelType: FuelType;
  transmissionType: TransmissionType;
  image?: string;
  totalQuantity?: number;
  availableQuantity?: number;
}

export const CreateCarSchema = Joi.object({
  model: Joi.string().required(),
  brand: Joi.string().required(),
  pricePerDay: Joi.number().precision(2).positive().required(),
  carStatus: Joi.string().valid(...Object.values(CarStatus)).optional(),
  fuelType: Joi.string().valid(...Object.values(FuelType)).required(),
  transmissionType: Joi.string().valid(...Object.values(TransmissionType)).required(),
  image: Joi.string().uri().optional(),
  totalQuantity: Joi.number().integer().positive().optional(),
  availableQuantity: Joi.number().integer().positive().optional(),
});
