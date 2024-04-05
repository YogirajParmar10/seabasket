import { IsNumber, IsNotEmpty } from "class-validator";

export class OrderDto {
  @IsNotEmpty()
  @IsNumber()
  cartId: number;
}
