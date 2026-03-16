import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ObjectSchema } from 'joi';
import { PAYLOAD_VALIDATION_SCHEMA } from '../decorators/payload-validation.decorator';


@Injectable()
export class PayloadValidationGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        
        
        // Reads Joi schema metadata from the route or controller.
        const schema = this.reflector.getAllAndOverride<ObjectSchema>(PAYLOAD_VALIDATION_SCHEMA, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If no schema; skip validation (return true).
        if (!schema) {
            return true;
        }

        
        // Retrieves request body.
        const request = context.switchToHttp().getRequest();
        // Validates it against the Joi schema.
        const { error } = schema.validate(request.body);

        
        // Throws 400 Bad Request if validation fails.
        if (error) {
            throw new BadRequestException(`Validation failed: ${error.message}`);
        }

        return true;
    }
}
