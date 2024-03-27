import Email from "email-templates";
import nodemailer from "nodemailer";
import twilio from "twilio";
import { Constants, env } from "@configs";
import { Log } from "./logger.helper";

export class Notification {
  public static async email(templateName: string, dynamicData: object, to: string[]) {
    const logger = Log.getLogger();
    const emailTransport = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: false,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });

    const email = new Email({
      message: {
        from: Constants.FROM_EMAIL,
      },
      send: true,
      transport: emailTransport,
    });

    const sentEmail = await email.send({
      template: templateName,
      message: { to },
      locals: dynamicData,
    });
    logger.info("Email sent successfully", { emails: to, messageId: sentEmail.messageId });

    return sentEmail;
  }

  public static async sms(message: string, phoneNumber: string): Promise<void> {
    const logger = Log.getLogger();
    const client = twilio(env.twilioSID, env.twilioToken);
    try {
      const twilioMessage = await client.messages.create({
        body: message,
        from: env.twilioNumber,
        to: phoneNumber,
      });
      logger.info("SMS sent with SID", twilioMessage.messagingServiceSid);
    } catch (err) {
      logger.warn("Error sending SMS", err);
      throw err;
    }
  }
}
