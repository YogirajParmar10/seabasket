import { IsBoolean, IsEmail, IsInt, IsMobilePhone, IsNotEmpty, IsOptional, IsString, IsUrl, Length, Matches, MaxLength } from "class-validator";
import { Constants } from "../../../configs/constants";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(Constants.FIRST_NAME_MAX_LENGTH)
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(Constants.EMAIL_MAX_LENGTH)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  })
  @Length(Constants.PASSWORD_MIN_LENGTH, Constants.PASSWORD_MAX_LENGTH)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  mobile!: string;
}
