import { Wallet } from "../../controllers/wallet";
import {
  donationQueue,
  emailQueue,
  rabbitMqSettings,
  walletCreationQueue,
} from "../../utils/constant";
// import { rabbitMqChannel } from "./producer"
import amqp from "amqplib";
import sendMail from "../../utils/email";
import { DatabaseService } from "../database";

export const consumer = async () => {
  const conn = await amqp.connect(rabbitMqSettings);
  const rabbitMqChannel = await conn.createChannel();
  await rabbitMqChannel.assertQueue(emailQueue);
  await rabbitMqChannel.assertQueue(walletCreationQueue);
  await rabbitMqChannel.assertQueue(donationQueue);
  rabbitMqChannel.consume(walletCreationQueue, async (message) => {
    const msg = JSON.parse(message.content.toString());

    try {
      console.log(msg);
      // CREATE NEW WALLET
      const wallet = new Wallet();
      const mewWallet = await wallet.createWallet(msg.id);
      rabbitMqChannel.ack(message);

      await sendMail(
        msg.firstName,
        msg.email,
        "Wallet Created",
        `<strong>Your wallet id is ${mewWallet.id} </strong>`,
        "you can now make donations"
      );

      console.log({
        message: `wallet created successfully`,
      });

      // send wallet details to user email
    } catch (error) {
      console.log({
        message: "consumer message",
        error: JSON.stringify(error),
      });
    }
  });

  rabbitMqChannel.consume(donationQueue, async (message) => {
    try {
      const msg = JSON.parse(message.content.toString());
      const dbService = new DatabaseService();
      const response = await dbService.transfer(msg.fromWalletId, msg.toWalletId, msg.amount);
      if (!response.success) {
        return await sendMail(
          msg.userName,
          msg.email,
          "Donation Error",
          `<strong>Donation of ${msg.amount} to ${msg.toWalletId} was not successful</strong>`,
          "Please try again"
        );
      }
      await dbService.saveDonation(msg.fromWalletId, msg.toWalletId, msg.amount, msg.note);
      const totalDonations = await dbService.getDonationsByWalletId(
        msg.fromWalletId,
        Number(1),
        Number(10)
      );
      // console.log({
      //   totalDonations: totalDonations.data,
      // });
      await sendMail(
        msg.userName,
        msg.email,
        "Donation Receipt",
        "<strong>Donation of ${msg.amount} to ${msg.toWalletId} was not successful</strong>",
        "Thank You"
      );

      if (totalDonations.data.length > 1) {
        console.log(`The donator has made multiple donations. So send a mail`);
        await sendMail(
          msg.userName,
          msg.email,
          "Appreciation",
          "<strong>Thank you. We sincerely appreciate your kind gesture!</strong>",
          "We sincerely appreciate your kind gesture"
        );
      } else {
        console.log(`The donator has just made an initial donation. Don't send a mail`);
      }
      rabbitMqChannel.ack(message);
    } catch (error) {
      console.log("...", error);
    }
  });
};
