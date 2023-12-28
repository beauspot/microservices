import express from "express";
import { ProductServiceController } from "../controllers/products.controller";

const router = express.Router();

router
  .route("/prods")
  .get(ProductServiceController.getAllProducts)
  .post(ProductServiceController.createProductController);

router
  .route("/prods/:id")
  .get(ProductServiceController.getSingleProduct)
  .patch(ProductServiceController.updateSingleProduct)
  .delete(ProductServiceController.deleteProduct);

export default router;
