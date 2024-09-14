export const rabbitMqSettings = {
  protocol: "amqp",
  hostname: "rabbitmq",
  port: 5672,
  username: "guest",
  password: "guest",
  vhost: "/",
  authMechanism: ["PLAIN", "AMQPLAIN", "EXTERNAL"],
};

export const emailQueue = "emails";
export const walletCreationQueue = "wallet";
export const donationQueue = "donation";
