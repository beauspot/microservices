import express from "express";
import { CustomerController } from "../controllers/customerControllers";
import { auth, isAdmin } from "../helpers/middlewares/authMiddleware";

const router = express.Router();

router.route("/signup").post(CustomerController.signUpUser);
router.route("/login").post(CustomerController.login_user);
router.route("/login-admin").post(CustomerController.login_administrator);

router.route("/users").get(auth, isAdmin, CustomerController.get_all_users);
router.route("/logout").get(CustomerController.LogoutController);
router.route("/refresh-token").get(CustomerController.handleRefreshToken);

router
  .route("/users/:id")
  .get(auth, isAdmin, CustomerController.get_single_user)
  .delete(auth, isAdmin, CustomerController.delete_user)
  .patch(auth, isAdmin, CustomerController.update_user_data)
  .patch(auth, isAdmin, CustomerController.blockCustomer)
  .patch(auth, isAdmin, CustomerController.unblock_user);

export default router;