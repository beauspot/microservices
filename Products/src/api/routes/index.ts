import express from "express";
import productRoute from "./product.routes";
import { AppConfig } from ".././helpers/config/app.config";

const router = express.Router();

const API_PREFIX = AppConfig.API_PREFIX;

router.use(`/${API_PREFIX}`, productRoute);

export default router;
