export class GenerateOTP {
  public static generate(): number {
    const min = 10 ** 5;
    const max = 10 ** 6 - 1;
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNum;
  }
}
