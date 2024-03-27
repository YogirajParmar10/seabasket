import { Constants } from "@configs";
import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(Constants.EMAIL_MAX_LENGTH)
  public email: string;
}
