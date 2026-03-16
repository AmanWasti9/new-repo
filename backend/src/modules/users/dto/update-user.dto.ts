import Joi from 'joi';
import { Role } from 'src/common/enums/roles.enum';

export class UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

export const UpdateUserSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string()
    .valid(...Object.values(Role))
    .optional(),
});
