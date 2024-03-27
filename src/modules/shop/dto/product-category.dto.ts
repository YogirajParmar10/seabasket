import { IsNotEmpty, IsString } from "class-validator";

export class ProductByCategoryDto {
  @IsString()
  @IsNotEmpty()
  category!: string;
}
