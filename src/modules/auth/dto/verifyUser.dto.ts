import { Constants } from "@configs";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class VerifyUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(Constants.OTP_LENGTH)
  otp: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(Constants.EMAIL_MAX_LENGTH)
  @IsOptional()
  email: string;
}
