export class RewardItemDto {
  id!: string;
  name!: string;
  description!: string;
  points_cost!: number;
  stock_quantity!: number;
  image_url?: string;
  is_active!: boolean;
}

export class RedeemItemDto {
  item_id!: string;
}