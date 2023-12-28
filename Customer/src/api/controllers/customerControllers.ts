import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { generateRefreshToken } from "../helpers/utils/refreshToken";
import { CustomerServiceClass } from "../services/customer.service";
// import { AuthenticatedRequest } from "../helpers/interfaces/authenticateRequest";

export class CustomerController {
  public static async signUpUser(req: Request, res: Response): Promise<void> {
    if (!req.body) {
      throw new Error("The body property is required.");
    }

    // Callling the create_user_service function.
    const { newUser, userToken } =
      await CustomerServiceClass.create_user_service(req.body);
    res
      .status(StatusCodes.CREATED)
      .json({ UserData: { userEmail: newUser.email }, token: userToken });
  }

  public static async login_user(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    // Pass email and password separately to login_user_service
    const { userExists, token, updateLoggedUser } =
      await CustomerServiceClass.login_user_service({
        email,
        password,
      });

    // checking if the user with the email exists or not.
    if (!userExists) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        errMessage: `The user with the email: ${email} is not registered`,
      });
    }
    const refreshToken = generateRefreshToken(userExists._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.status(StatusCodes.OK).json({
      userData: { userEmail: email },
      Token: token,
      refToken: updateLoggedUser?.refreshToken,
    });
  }

  public static async login_administrator(
    req: Request,
    res: Response
  ): Promise<void> {
    const { email, password } = req.body;

    // Pass email and password separately to login_user_service
    const { AdminExists, token, updateLoggedUser } =
      await CustomerServiceClass.login_admin_service({
        email,
        password,
      });

    // checking if the user with the email exists or not.
    if (!AdminExists) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        errMessage: `The user with the email: ${email} is not registered`,
      });
    }
    const refreshToken = generateRefreshToken(AdminExists._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.status(StatusCodes.OK).json({
      userData: { userEmail: email },
      Token: token,
      refToken: updateLoggedUser?.refreshToken,
    });
  }

  public static async get_all_users(
    req: Request,
    res: Response
  ): Promise<void> {
    const users = await CustomerServiceClass.get_all_users_service();
    //console.log(users);
    res.status(StatusCodes.OK).json({ numberOfUsers: users.length, users });
  }

  public static async get_single_user(
    req: Request,
    res: Response
  ): Promise<void> {
    const { id } = req.params;

    const userDataID = await CustomerServiceClass.get_single_user_service(id);

    res.status(StatusCodes.OK).json({ userDataID });
  }

  public static async delete_user(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userDataId = await CustomerServiceClass.delete_single_customer({
      id,
    });
    res
      .status(StatusCodes.OK)
      .json({ status: "Deleted User Successfully", userDataId });
  }

  public static async update_user_data(
    req: Request,
    res: Response
  ): Promise<void> {
    const { id } = req.params;
    const updatedUser = await CustomerServiceClass.update_customer_details(
      { id },
      req.body
    );
    res
      .status(StatusCodes.OK)
      .json({ status: "successfully Updated User", updatedUser });
  }

  public static async blockCustomer(
    req: Request,
    res: Response
  ): Promise<void> {
    const { id } = req.params;
    // console.log(id);
    const blockedUser = await CustomerServiceClass.blockUserService({ id });
    res.status(StatusCodes.OK).json({
      status: "User blocked Successfully",
      userData: { userBlocked: blockedUser.isBlocked },
    });
  }

  public static async unblock_user(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    // console.log(id);
    const unblockedUser = await CustomerServiceClass.unBlockUserService({ id });
    res.status(StatusCodes.OK).json({
      status: `User Un-Blocked Successfully`,
      userData: { userBlocked: unblockedUser.isBlocked },
    });
  }

  public static async handleRefreshToken(
    req: Request,
    res: Response
  ): Promise<void> {
    const { cookies } = req;
    const accessTokens =
      await CustomerServiceClass.handle_refresh_token_service(cookies);
    console.log(accessTokens);
    res.status(StatusCodes.OK).json({ A_T: accessTokens });
  }

  public static async LogoutController(
    req: Request,
    res: Response
  ): Promise<void> {
    const refreshToken = req.cookies.refreshToken;
    const result = await CustomerServiceClass.LogoutService(refreshToken);
    if (!result) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
      });
      res.sendStatus(204); // forbidden
    } else {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
      });
      res.sendStatus(200); // success
    }
  }

  public static async forgotPassword(
    req: Request,
    res: Response
  ): Promise<void> {
    const { email } = req.body;

    await CustomerServiceClass.fgtPwdService(email);
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Password reset link sent to the user email.",
    });
  }

  public static async passwordReset(
    req: Request,
    res: Response
  ): Promise<void> {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    try {
      await CustomerServiceClass.resetPwdService(
        token,
        password,
        confirmPassword
      );

      res.status(StatusCodes.OK).json({
        status: "Success",
        message: "Password reset Successful",
      });
    } catch (error: any) {
      res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
    }
  }
}
