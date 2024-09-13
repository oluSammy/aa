import amqp from "amqplib";
import { donationQueue, emailQueue, rabbitMqSettings, walletCreationQueue } from "../../utils/constant";

export let rabbitMqChannel;

export const rabbitMqProducer = async () => {
  try {
    const conn = await amqp.connect(rabbitMqSettings);
    rabbitMqChannel = await conn.createChannel();

    await rabbitMqChannel.assertQueue(emailQueue);
    await rabbitMqChannel.assertQueue(walletCreationQueue);
    await rabbitMqChannel.assertQueue(donationQueue);
  } catch (error) {
    console.log(error);
  }
};
