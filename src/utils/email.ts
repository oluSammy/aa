import dotenv from "dotenv";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

dotenv.config();


const sendMail = async (username:string, emailId:string)=>{
    const mailerSend = new MailerSend({
    apiKey: process.env.MAIL_API_KEY
  });
  
  const sentFrom = new Sender(process.env.MAIL_SENTFROM, process.env.MAIL_USERNAME);
  
  const recipients = [
    new Recipient(emailId, username)
  ];
  
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject("Appreciation")
    .setHtml("<strong>Thank you. We sencerely appreciate your kind gesture!</strong>")
    .setText("We sencerely appreciate your kind gesture");

    return mailerSend.email.send(emailParams);
}


export default sendMail