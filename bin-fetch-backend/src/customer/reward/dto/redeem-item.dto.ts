import { IsUUID } from 'class-validator';

export class RedeemItemDto {
  @IsUUID()
  item_id!: string;
}