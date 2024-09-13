export const rabbitMqSettings = {
  protocol: "amqp",
  hostname: "localhost",
  port: 5672,
  username: "guest",
  password: "guest",
  vhost: "/",
  authMechanism: ["PLAIN", "AMQPLAIN", "EXTERNAL"],
};

export const emailQueue = "emails";
export const walletCreationQueue = "wallet";
export const donationQueue = "donation";
