import { Constants } from "@configs";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(Constants.NAME_MAX_LENGTH)
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(Constants.EMAIL_MAX_LENGTH)
  @IsOptional()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @IsOptional()
  mobile!: string;
}
