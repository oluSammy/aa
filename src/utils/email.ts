import dotenv from "dotenv";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

dotenv.config();

const sendMail = async (
  username: string,
  emailId: string,
  subject: string,
  html: string,
  subText: string
) => {
  const mailerSend = new MailerSend({
    apiKey: process.env.MAIL_API_KEY,
  });

  const sentFrom = new Sender("fastamoni@trial-pr9084zp2ejgw63d.mlsender.net", process.env.MAIL_USERNAME);

  const recipients = [new Recipient(emailId, username)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(subject)
    .setHtml(html)
    .setText(subText);

  return mailerSend.email.send(emailParams);
};

export default sendMail;
