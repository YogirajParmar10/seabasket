import { IsNotEmpty, IsString } from "class-validator";

export class ReviewsDto {
  @IsString()
  @IsNotEmpty()
  review: string;
}
