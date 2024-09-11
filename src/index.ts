import express, { Request, Response } from "express";
import "reflect-metadata";

import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", routes);

app.get("/", (_: Request, res: Response) => {
  res.send("Hello Fastmoni");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
