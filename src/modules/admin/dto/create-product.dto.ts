import { MinLength, IsNotEmpty, IsString, MaxLength, IsUrl, IsDecimal } from "class-validator";
import { Constants } from "@configs";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(Constants.PRODUCT_TITLE_MAX_LENGTH)
  @MinLength(Constants.PRODUCT_TITLE_MIN_LENGTH)
  title: string;

  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;

  @IsDecimal()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsDecimal()
  @IsNotEmpty()
  rating: number;

  @IsDecimal()
  @IsNotEmpty()
  discount: number;
}
