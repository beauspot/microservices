import express from "express";
import customerRoute from "./customer.routes";
import AppConfig from ".././helpers/config/AppConfig";

const router = express.Router();

const API_PREFIX = AppConfig.API_PREFIX;

router.use(`/${API_PREFIX}`, customerRoute);

export default router;
