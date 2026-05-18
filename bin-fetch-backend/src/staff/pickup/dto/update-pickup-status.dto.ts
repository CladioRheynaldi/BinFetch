import { IsEnum } from 'class-validator';


export enum PickupStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PROCESSING = 'processing',   // NEW
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class UpdatePickupStatusDto {
  @IsEnum(PickupStatus)
  status!: PickupStatus;
}