import { MinLength, IsNotEmpty, IsString, MaxLength, IsOptional, IsNumber, IsDecimal } from "class-validator";
import { Constants } from "@configs";

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(Constants.PRODUCT_TITLE_MAX_LENGTH)
  @MinLength(Constants.PRODUCT_TITLE_MIN_LENGTH)
  title: string;

  @IsString()
  @IsOptional()
  imageUrl: string;

  @IsDecimal()
  @IsOptional()
  price: number;

  @IsDecimal()
  @IsOptional()
  description!: string;

  @IsString()
  @IsOptional()
  category!: string;

  @IsDecimal()
  @IsOptional()
  rating: string;

  @IsString()
  @IsOptional()
  discount: string;
}
