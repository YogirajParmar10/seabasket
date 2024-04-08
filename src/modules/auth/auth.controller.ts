import { NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { TRequest, TResponse } from "@types";
import { User, Otp, Cart } from "@entities";
import { Bcrypt, JwtHelper, GenerateOTP } from "@helpers";
import { CreateUserDto, ForgotPasswordDto, ResetPasswordDto, SignInDto, UpdateProfileDto, VerifyUserDto } from "./dto";
import { env } from "configs";
import nodemailer from "nodemailer";
import twilio from "twilio";
import { Op } from "sequelize";

const client = twilio(env.twilioSID, env.twilioToken);

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

export class AuthController {
  public signUp = async (req: TRequest<CreateUserDto>, res: TResponse, next: NextFunction) => {
    const { email, name, password, mobile } = req.dto;

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email: email }, { mobile: mobile }] },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    try {
      const hashedPass: string = await Bcrypt.hash(password);
      const user = await User.create({
        email: email,
        name: name,
        password: hashedPass,
        mobile: mobile,
      });
      res.status(201).json({
        message: "Sign-up Successful",
      });
      const userId = user.dataValues.id;

      const cart = await Cart.create({
        userId: userId,
      });

      transporter.sendMail({
        to: email,
        from: env.smtpUser,
        subject: "Signup-successful",
        html: "<h1> You have successfully signed-up with seabasket</h1>",
      });

      const message = await client.messages.create({
        body: "This is a test message from Twilio!",
        from: env.twilioNumber,
        to: mobile,
      });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internal_server_error;
      }
      next(err);
    }
  };

  public signIn = async (req: TRequest<SignInDto>, res: TResponse, next: NextFunction) => {
    const { email, password, mobile } = req.dto;

    try {
      let user;

      if (email) {
        user = await User.findOne({ where: { email: email } });
      } else {
        user = await User.findOne({ where: { mobile: mobile } });
      }

      if (!user) {
        return res.status(env.statuscode.not_found).json({ message: "Please verify your email" });
      }

      if (user.dataValues.isVerified === false) {
        return res.json({ message: "Please verify you email first" });
      }

      const isEqual: boolean = await Bcrypt.verify(password, user.dataValues.password);
      if (!isEqual) {
        return res.status(env.statuscode.unauthorized).json({ message: "Invalid password" });
      }

      const token: string = JwtHelper.encode({ id: user.dataValues.id });

      res.setHeader("Authorization", `Bearer ${token}`);
      return res.status(env.statuscode.success).json({ message: "Sign-in successful", token });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internal_server_error;
      }
      next(err);
    }
  };

  public forgotPassword = async (req: TRequest<ForgotPasswordDto>, res: TResponse) => {
    const { email } = req.dto;

    try {
      const token: string = JwtHelper.encode({ email: email });

      transporter.sendMail({
        to: email,
        from: env.smtpUser,
        subject: "Reset Password",
        html: `
      <p> Request was made to change the password for ${email} </p>
      <p> Use this token: ${token} to change password </p>
      `,
      });
      return res.status(env.statuscode.success).json({ message: "Token is sent to your email" });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internal_server_error;
      }
      next(err);
    }
  };

  public resetPassword = async (req: TRequest<ResetPasswordDto>, res: TResponse, next: NextFunction) => {
    const { password } = req.dto;
    const { token } = req.params;

    try {
      let decodedToken = JwtHelper.justDecode(token) as JwtPayload;

      if (!decodedToken) {
        const err = new Error("Please Verify your token");
        throw err;
      }

      const updatedPassword = await Bcrypt.hash(password);
      const email = decodedToken.email;

      const user = await User.update(
        {
          password: updatedPassword,
        },
        {
          where: {
            email: email,
          },
        },
      );
      if (!user) {
        return res.status(env.statuscode.internal_server_error).json({ message: "Password updation failed" });
      }

      return res.status(env.statuscode.success).json({ message: "Password Updated" });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internal_server_error;
      }
      next(err);
    }
  };

  public updateProfile = async (req: TRequest<UpdateProfileDto>, res: TResponse, next: NextFunction) => {
    const { email, mobile, name } = req.dto;
    const userId = req.user.id;
    let existingUser;

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(env.statuscode.not_found).json({ message: "Unauthorized" });
      }

      if (email === undefined) {
        existingUser = await User.findOne({
          where: { mobile: mobile },
        });
      } else if (mobile === undefined) {
        existingUser = await User.findOne({
          where: { email: email },
        });
      }

      if (existingUser) {
        return res.status(400).json({ message: "User already registered" });
      }

      await User.update(
        {
          email: email,
          mobile: mobile,
          name: name,
        },
        { where: { id: userId } },
      );
      return res.status(env.statuscode.success).json({ message: "Update successful" });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internal_server_error;
      }
      next(err);
    }
  };

  public sendOtp = async (req: TRequest, res: TResponse, next: NextFunction) => {
    const email = req.body.email;

    try {
      const user = User.findOne({ where: { email: email } });

      if (!user) {
        return res.status(env.statuscode.not_found).json({ message: "Please verify your email" });
      }

      const otp = await GenerateOTP.generate();

      transporter.sendMail({
        to: email,
        from: env.smtpUser,
        subject: "Email verification",
        html: `
        <h2>Verify your email address</h2>
        </br>
      <p> You need to verify your email address to continue using your Seabasket account. Enter the following code to verify your email address:</p>
      </br>
      <h2>${otp}</h2> 
      <hr>
      <p>In case it wasn't you & are seeing this email, please follow the instructions below:</p>
      <ul>
        <li>Reset your Twilio password.</li>
        <li>Check if any changes were made to your account & user settings. If yes, revert them immediately.</li>
      </ul>
      `,
      });

      await Otp.create({
        email: email,
        otp: otp,
      });
      return res.status(env.statuscode.success).json({ message: "Please check your email for otp and verify to continue" });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = env.statuscode.internal_server_error;
      }
      next(err);
    }
  };

  public verifyUser = async (req: TRequest<VerifyUserDto>, res: TResponse, next: NextFunction) => {
    const { otp, email } = req.body;

    const verification_otp = await Otp.findOne({ where: { email: email } });

    if (+otp !== verification_otp.dataValues.otp) {
      return res.status(env.statuscode.unauthorized).json({ message: "Please verify your otp" });
    }
    await User.update({ isVerified: true }, { where: { email: email } });
    await Otp.destroy({ where: { email: email } });

    return res.status(env.statuscode.success).json({ message: "User is verified" });
  };
}
function next(err: any) {
  throw new Error("Function not implemented.");
}
