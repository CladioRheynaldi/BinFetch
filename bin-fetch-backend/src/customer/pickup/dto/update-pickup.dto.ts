import { IsEnum, IsNumber, IsString, IsOptional, Min, Max, IsLatitude, IsLongitude } from 'class-validator';
import { WasteCategory } from './create-pickup.dto';

export class UpdatePickupDto {
  @IsOptional()
  @IsEnum(WasteCategory)
  waste_type?: WasteCategory;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(500)
  volume_kg?: number;

  @IsOptional()
  @IsString()
  pickup_address?: string;

  @IsOptional()
  @IsLatitude()
  pickup_lat?: number;

  @IsOptional()
  @IsLongitude()
  pickup_lng?: number;

  @IsOptional()
  @IsString()
  special_instructions?: string;
}
