import { IsEnum, IsNumber, Min, Max, IsOptional } from 'class-validator';


export enum WasteCategory {
  PLASTIC = 'plastic',
  ELECTRONIC = 'electronic',
  ORGANIC = 'organic',
  PAPER = 'paper',
  MIXED = 'mixed',
}

export class CompletePickupDto {
  @IsEnum(WasteCategory)
  actual_waste_type!: WasteCategory;  

  @IsNumber()
  @Min(0.1)
  @Max(500)
  actual_volume_kg!: number;           

  @IsOptional()
  @IsNumber()
  @Min(0)
  manual_points?: number;
}