import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { TRequest, TResponse } from "@types";
import { User } from "entities/user.entity";
import { Bcrypt, JwtHelper, GenerateOTP, Notification } from "@helpers";
import { CreateUserDto, ForgotPasswordDto, ResetPasswordDto, SignInDto } from "./dto";

import nodemailer from "nodemailer";
import { Cart } from "@entities";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "alf.thiel48@ethereal.email",
    pass: "5pUNwFnHSrFFxEdDVR",
  },
});

export class AuthController {
  public signUp = async (req: TRequest<CreateUserDto>, res: TResponse, next: NextFunction) => {
    const email: string = req.dto.email;

    const existingUser = await User.findOne({
      where: { email: req.body.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const name: string = req.dto.name;
    const password: string = req.dto.password;
    const mobile = req.dto.mobile;

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
      transporter.sendMail({
        to: email,
        from: "alf.thiel48@ethereal.email",
        subject: "Signup-successful",
        html: "<h1> You have successfully signed-up with seabasket</h1>",
      });

      const userId = user.dataValues.id;

      const cart = await Cart.create({
        userId: userId,
      });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public signIn = async (req: TRequest<SignInDto>, res: TResponse, next: NextFunction) => {
    const { email, password } = req.dto;

    try {
      let user;
      user = await User.findOne({ where: { email: email } });

      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      const isEqual: boolean = await Bcrypt.verify(password, user.dataValues.password);
      if (!isEqual) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const token = JwtHelper.encode({ id: user.dataValues.id });

      res.setHeader("Authorization", `Bearer ${token}`);
      return res.status(200).json({ message: "Sign-in successful", token });
    } catch (err: any) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  public forgotPassword = async (req: TRequest<ForgotPasswordDto>, res: TResponse) => {
    const { email } = req.dto;

    const token = JwtHelper.encode({ email: email });

    transporter.sendMail({
      to: email,
      from: "alf.thiel48@ethereal.email",
      subject: "Reset Password",
      html: `
      <p> Request was made to change the password for ${email} </p>
      <p> Use this token: ${token} to change password </p>
      `,
    });
    return res.status(200).json({ message: "Token is sent to your email" });
  };

  public resetPassword = async (req: TRequest<ResetPasswordDto>, res: TResponse, next: NextFunction) => {
    const { password } = req.dto as ResetPasswordDto;
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
        return res.status(500).json({ message: "Password updation failed" });
      }

      return res.status(200).json({ message: "Password Updated" });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };
}
function next(err: any) {
  throw new Error("Function not implemented.");
}
