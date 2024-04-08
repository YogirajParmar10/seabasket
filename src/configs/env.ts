import { IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";
import dotenv from "dotenv";

dotenv.config();

class Env {
  @IsNotEmpty()
  public dbDialect: any;

  @IsInt()
  @Min(2000)
  @Max(9999)
  public port: number;

  @IsNotEmpty()
  public dbName: string;

  @IsNotEmpty()
  public dbHost: string;

  @IsNotEmpty()
  public dbUser: string;

  @IsInt()
  @Min(2000)
  @Max(9999)
  public dbPort: number;

  @IsNotEmpty()
  public dbPassword: string;

  @IsNotEmpty()
  @IsInt()
  public smtpPort: number;

  @IsNotEmpty()
  @IsString()
  public smtpHost: string;

  @IsNotEmpty()
  @IsString()
  public smtpUser: string;

  @IsNotEmpty()
  @IsString()
  public smtpPass: string;

  @IsNotEmpty()
  @IsString()
  public twilioSID: string;

  @IsNotEmpty()
  @IsString()
  public twilioToken: string;

  @IsNotEmpty()
  @IsString()
  public twilioNumber: string;


  @IsNotEmpty()
  @IsString()
  public stripePrivate: string;
}

export const env = new Env();

env.dbDialect = process.env.DB_DIALECT;
env.dbName = process.env.DB_NAME;
env.dbHost = process.env.DB_HOST;
env.dbUser = process.env.DB_USER;
env.dbPort = +(process.env.DB_PORT || 3306);
env.dbPassword = process.env.DB_PASSWORD;
env.port = +process.env.PORT;
env.smtpHost = process.env.SMTP_HOST;
env.smtpPort = +process.env.SMTP_PORT;
env.smtpUser = process.env.SMTP_USER;
env.smtpPass = process.env.SMTP_PASS;
env.twilioSID = process.env.TWILIO_SID;
env.twilioToken = process.env.TWILIO_TOKEN;
env.twilioNumber = process.env.TWILIO_NUMBER;
env.stripePrivate = process.env.STRIPE_PRIVATE_KEY;