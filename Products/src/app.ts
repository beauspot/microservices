import "reflect-metadata";
import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes";

import { applicationConfig } from "./api/helpers/config/app.config";
import __404_err_page from "./api/helpers/middlewares/notFound";
import errorHandlerMiddleware from "./api/helpers/middlewares/errHandler";

// Routing
import productRoute from "./api/routes/product.routes";

const API_PREFIX = applicationConfig.API_PREFIX;
const app = express();
const corsOptions = {
  origin: "*",
  credentials: true,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("tiny"));
} else {
  app.use(morgan("dev"));
}

app.get(`/${API_PREFIX}`, (req: Request, res: Response) => {
  res.status(StatusCodes.PERMANENT_REDIRECT).json({
    message: "Welcome to the Product-Micro-Service rest api application.",
  });
});

app.use(productRoute);

app.use(errorHandlerMiddleware);
app.use("*", __404_err_page);

export default app;
