import { MinLength, IsNotEmpty, IsString, MaxLength, IsOptional, IsNumber } from "class-validator";
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

  @IsNumber()
  @IsOptional()
  price: number;

  @IsString()
  @IsOptional()
  description!: string;

  @IsString()
  @IsOptional()
  category!: string;

  @IsString()
  @IsOptional()
  rating: string;

  @IsString()
  @IsOptional()
  discount: string;
}
