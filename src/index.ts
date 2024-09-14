import express, { Request, Response } from "express";
import "reflect-metadata";
import logger from "morgan";

import dotenv from "dotenv";
import routes from "./routes";
import { rabbitMqProducer } from "./services/rabbitmq/producer";
import { consumer } from "./services/rabbitmq/consumer";

dotenv.config();

const app = express();
const port = 3000;
app.use(logger("combined"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", routes);

console.log({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 16719
})

app.get("/", (_: Request, res: Response) => {
  res.send("Hello Fastmoni");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

consumer().then(() => {
  console.log("rabbit mq consumer")
})

rabbitMqProducer().then(() => {
  console.log("rabbit mq producer")
})
