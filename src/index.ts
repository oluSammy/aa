import express, { Request, Response } from "express";
import "reflect-metadata";
import logger from "morgan";

import dotenv from "dotenv";
import routes from "./routes";
import { rabbitMqProducer } from "./services/rabbitmq/producer";
import { consumer } from "./services/rabbitmq/consumer";

dotenv.config();

const app = express();
const port = process.env.PORT;
app.use(logger("combined"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", routes);

rabbitMqProducer();
consumer();

app.get("/", (_: Request, res: Response) => {
  res.send("Hello Fastmoni");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
