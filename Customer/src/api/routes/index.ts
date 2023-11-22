import express from "express";
import customerRoute from "./customer.routes";

const router = express.Router();

router.use("/", customerRoute);

export default router;
