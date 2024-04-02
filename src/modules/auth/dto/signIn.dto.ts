import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Constants } from "@configs";

export class SignInDto {
  @IsString()
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(Constants.PASSWORD_MAX_LENGTH)
  password: string;
}
