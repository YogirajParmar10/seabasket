import { IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";
import dotenv from "dotenv";
import { StatusCode } from "./status-code";

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

  @IsNotEmpty()
  @IsString()
  public stripeSuccess: string;

  @IsNotEmpty()
  @IsString()
  public stripeCancel: string;

  @IsNotEmpty()
  @IsString()
  public currency: string;

  @IsNotEmpty()
  @IsInt()
  public success: number;

  @IsNotEmpty()
  @IsInt()
  public internalServerError: number;

  @IsNotEmpty()
  public statuscode: StatusCode;

  @IsNotEmpty()
  @IsInt()
  public unAuthorized: number;

  @IsNotEmpty()
  @IsInt()
  public notFound: number;

  @IsNotEmpty()
  @IsInt()
  public created: number;

  @IsNotEmpty()
  @IsInt()
  public conflict: number;
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
env.stripeSuccess = process.env.STRIPE_SUCCESS_URL;
env.stripeCancel = process.env.STRIPE_CANCEL_URL;
env.currency = process.env.CURRENCY;
env.success = +process.env.STATUS_CODE_SUCCESS;
env.internalServerError = +process.env.STATUS_CODE_INTERNAL_SERVER_ERROR;
env.notFound = +process.env.STATUS_CODE_NOT_FOUND;
env.unAuthorized = +process.env.STATUS_CODE_UNAUTHORIZED;
env.created = +process.env.STATUS_CODE_CREATED;
env.conflict = +process.env.STATUS_CODE_CONFLICT;
env.statuscode = {
  success:env.success,
  internalServerError: env.internalServerError,
  notFound:env.notFound,
  unAuthorized: env.unAuthorized,
  created: env.created,
  conflict: env.conflict
}
