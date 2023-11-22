// external dependencies
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { StatusCodes } from "http-status-codes";
import MongodbSession from "connect-mongodb-session";
import cookieParser from "cookie-parser";
import session from "express-session";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

import AppConfig from "./api/helpers/config/AppConfig";
import __404_err_page from "./api/helpers/middlewares/notFound";
import errorHandlerMiddleware from "./api/helpers/middlewares/errHandler";

// Routing
import customerRoute from "./api/routes";

const API_PREFIX = AppConfig.API_PREFIX;
const app = express();
const corsOptions = {
  origin: "*",
  credentials: true,
};

// Reference path for sessions.
/// <reference path="./api/types/express/custom.d.ts" />

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
const MongoDBStore = MongodbSession(session);
const store = new MongoDBStore({
  uri: process.env.MONGO_URL!,
  collection: "Sessions-Collection",
  expires: 60 * 60, // session will expire in 1hr
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors(corsOptions));
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(limiter);
app.use(xss());
app.use(helmet());
app.use(mongoSanitize());
app.use(cookieParser());
app.use(
  session({
    resave: false,
    secret: process.env.SESSION_SECRET_KEY!,
    saveUninitialized: false,
    store: store,
    cookie: {
      sameSite: "strict",
      secure: false, // use true if using https
      maxAge: 1000 * 60 * 60, // cookie would expire in 1 hour
    },
  })
);
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("tiny"));
} else {
  app.use(morgan("dev"));
}

app.get(`/`, (req: Request, res: Response) => {
  req.session.isAuth = true;
  res.status(StatusCodes.PERMANENT_REDIRECT).json({
    message: "Welcome to the User-Micro-Service rest api application.",
  });
});

app.use(customerRoute);

app.use(errorHandlerMiddleware);
app.use("*", __404_err_page);

export default app;
