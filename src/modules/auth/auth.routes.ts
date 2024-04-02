import { RouterDelegates } from "@types";
import { InjectCls, AppRouter, Validator } from "@helpers";
import { AuthMiddleware } from "@middlewares";
import { CreateUserDto, ForgotPasswordDto, ResetPasswordDto, SignInDto, UpdateProfileDto } from "./dto";
import { AuthController } from "./auth.controller";

export class AuthRouter extends AppRouter implements RouterDelegates {
  @InjectCls(AuthController)
  private userController: AuthController;

  @InjectCls(AuthMiddleware)
  private authMiddleware: AuthMiddleware;

  initRoutes(): void {
    this.router.post("/sign-up", Validator.validate(CreateUserDto), this.userController.signUp);
    this.router.post("/sign-in", Validator.validate(SignInDto), this.userController.signIn);
    this.router.post("/forgot-password", Validator.validate(ForgotPasswordDto), this.userController.forgotPassword);
    this.router.post("/reset-password/:token", Validator.validate(ResetPasswordDto), this.userController.resetPassword);
    this.router.post("/send-otp", this.userController.sendOtp);
    this.router.post("/verify", this.userController.verifyUser);

    // update profile
    this.router.put("/profile", Validator.validate(UpdateProfileDto), this.authMiddleware.auth, this.userController.updateProfile);
  }
}
