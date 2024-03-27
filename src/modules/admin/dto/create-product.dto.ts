import { MinLength, IsNotEmpty, IsString, MaxLength, IsNumber, IsOptional } from "class-validator";
import { Constants } from "@configs";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(Constants.PRODUCT_TITLE_MAX_LENGTH)
  @MinLength(Constants.PRODUCT_TITLE_MIN_LENGTH)
  title: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsOptional()
  rating: string;

  @IsString()
  @IsOptional()
  discount: string;
}
