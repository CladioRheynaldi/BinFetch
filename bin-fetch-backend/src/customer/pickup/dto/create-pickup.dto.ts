import { IsEnum, IsNumber, IsString, IsOptional, Min, Max, IsLatitude, IsLongitude, IsDateString } from 'class-validator';

export enum WasteCategory {
  PLASTIC = 'plastic',
  ELECTRONIC = 'electronic',
  ORGANIC = 'organic',
  PAPER = 'paper',
  MIXED = 'mixed',
}

export class CreatePickupDto {
  @IsEnum(WasteCategory)
  waste_type!: WasteCategory;   // added !

  @IsNumber()
  @Min(0.1)
  @Max(500)
  volume_kg!: number;            // added !

  @IsString()
  pickup_address!: string;       // added !

  @IsOptional()
  @IsLatitude()
  pickup_lat?: number;

  @IsOptional()
  @IsLongitude()
  pickup_lng?: number;

  @IsOptional()
  @IsString()
  special_instructions?: string;

  @IsDateString()
  created_at!: string;
}