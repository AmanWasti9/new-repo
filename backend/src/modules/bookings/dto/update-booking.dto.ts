import { IsDateString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateBookingDto {
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}