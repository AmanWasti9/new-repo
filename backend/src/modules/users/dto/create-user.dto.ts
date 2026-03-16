import Joi from 'joi';
import { Role } from 'src/common/enums/roles.enum';

export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export const CreateUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string()
    .valid(...Object.values(Role))
    .optional(),
});
