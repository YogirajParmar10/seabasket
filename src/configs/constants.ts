export class Constants {
  public static readonly ENVIRONMENTS = ["development", "stage", "production"];

  public static readonly JWT_TOKEN_VERSION = "v1"; // Just increase to invalidate all sessions.

  public static readonly FROM_EMAIL = "no-reply@example.com";

  public static readonly BCRYPT_SALT_ROUND = 10;

  public static readonly NAME_MAX_LENGTH = 255;

  public static readonly EMAIL_MAX_LENGTH = 255;

  public static readonly PASSWORD_MAX_LENGTH = 255;

  public static readonly PASSWORD_MIN_LENGTH = 6;

  public static readonly PRODUCT_TITLE_MIN_LENGTH = 2;

  public static readonly PRODUCT_TITLE_MAX_LENGTH = 15;

  public static readonly OTP_EXPIRY = 300;

  public static readonly OTP_LENGTH = 6;
}
