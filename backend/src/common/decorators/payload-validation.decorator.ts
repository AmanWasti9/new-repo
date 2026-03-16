import { SetMetadata } from "@nestjs/common";
import { ObjectSchema } from "joi";

export const PAYLOAD_VALIDATION_SCHEMA = 'joi_scheme';
export const PayloadValidation = (schema: ObjectSchema) => SetMetadata(PAYLOAD_VALIDATION_SCHEMA, schema);