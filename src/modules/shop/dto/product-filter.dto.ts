import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class FilterProductDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  category!: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  rating: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  max_price: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  min_price: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  discount: number;
}
