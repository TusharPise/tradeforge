import { PipeTransform, ArgumentMetadata, BadRequestException, Injectable } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'custom' || !value) {
      return value;
    }

    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error: any) {
      const formattedErrors = error.errors?.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      })) || [{ message: 'Validation failed' }];
      
      throw new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }
  }
}
