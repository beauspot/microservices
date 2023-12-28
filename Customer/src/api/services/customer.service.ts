import { UserDataInterface } from "../helpers/interfaces/user_interface";
import { authModel } from "../models/userModels";
// import { AuthenticatedRequest } from "../helpers/interfaces/authenticateRequest";
import { validateMongoDbID } from "../helpers/utils/validateDbId";
import { StatusCodes } from "http-status-codes";
import CustomAPIError from "../helpers/utils/custom-errors";
import UnauthenticatedError from "../helpers/utils/unauthenticated";
import { generateRefreshToken } from "../helpers/utils/refreshToken";
import { generateToken } from "../helpers/utils/jsonWebToken";
import jwt from "jsonwebtoken";
import { IDecoded } from "../helpers/interfaces/authenticateRequest";
import { blacklistTokens } from "../models/blacklistTokens";
import crypto from "crypto";

export class CustomerServiceClass {
  // User or Customer Signup
  public static async create_user_service(
    userData: Partial<UserDataInterface>
  ) {
    try {
      const newUser = await authModel.create({ ...userData });
      const userToken = newUser.createJWT();

      return { newUser, userToken };
    } catch (error: any) {
      throw new Error(`Error signing up new User: ${error.message}`);
    }
  }

  // user / customer Login
  public static async login_user_service(userData: Partial<UserDataInterface>) {
    const { email, password } = userData; // Extract Email and Password from userData

    // checking if both fields are omitted
    if (!email || !password) {
      throw new CustomAPIError(
        `Email and Password are required for login.`,
        StatusCodes.BAD_REQUEST
      );
    }
    const userExists = await authModel.findOne({ email: email });
    if (!userExists) {
      throw new UnauthenticatedError(
        "Password or email didn't match any on our database",
        StatusCodes.NOT_FOUND
      );
    }
    // comparing the password of the user.
    const isMatch = await userExists.comparePwd(password);
    if (!isMatch) {
      throw new UnauthenticatedError(
        "Password or email didn't match any on our database",
        StatusCodes.NOT_FOUND
      );
    } else {
      //const token = userExists.createJWT();
      const token: string = generateToken(userExists._id);
      const refreshToken = generateRefreshToken(userExists._id);
      const updateLoggedUser = await authModel.findByIdAndUpdate(
        userExists._id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );
      return { userExists, token, updateLoggedUser };
    }
  }

  // Login admin
  public static async login_admin_service(
    AdminData: Partial<UserDataInterface>
  ) {
    const { email, password } = AdminData; // Extract Email and Password from userData

    // checking if both fields are omitted
    if (!email || !password) {
      throw new CustomAPIError(
        `Email and Password are required for login.`,
        StatusCodes.BAD_REQUEST
      );
    }
    const AdminExists = await authModel.findOne({ email: email });

    if (!AdminExists) {
      throw new UnauthenticatedError(
        "Password or email didn't match any on our database",
        StatusCodes.NOT_FOUND
      );
    }

    // checking fot the role of the Admin
    if (AdminExists.role !== "admin" && AdminExists.role !== "Admin")
      throw new CustomAPIError(
        `The User is not an administrator`,
        StatusCodes.BAD_REQUEST
      );

    // comparing the password of the user.
    const isMatch = await AdminExists.comparePwd(password);
    if (!isMatch) {
      throw new UnauthenticatedError(
        "Password or email didn't match any on our database",
        StatusCodes.NOT_FOUND
      );
    } else {
      //const token = userExists.createJWT();
      const token: string = generateToken(AdminExists._id);
      const refreshToken = generateRefreshToken(AdminExists._id);
      const updateLoggedUser = await authModel.findByIdAndUpdate(
        AdminExists._id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );
      return { AdminExists, token, updateLoggedUser };
    }
  }

  // get the total list of customers or users in the database
  public static async get_all_users_service(): Promise<UserDataInterface[]> {
    const getUsers = await authModel.find();
    if (getUsers.length <= 0) {
      throw new CustomAPIError(`No users found`, StatusCodes.NO_CONTENT);
    }
    return getUsers;
  }

  // get a single user or customer
  public static async get_single_user_service(
    userID: string
  ): Promise<UserDataInterface> {
    const id = userID; // destructure the user ID from the user
    validateMongoDbID(id);
    const userExists = await authModel.findById({ _id: id });
    console.log(userExists);
    if (!userExists) {
      throw new CustomAPIError(
        `The User with the ID: ${id} does not exist`,
        StatusCodes.NOT_FOUND
      );
    }
    return userExists;
  }

  // Delete a single user or customer from the database
  public static async delete_single_customer(
    userId: Partial<UserDataInterface>
  ): Promise<UserDataInterface> {
    const { id } = userId;
    validateMongoDbID(id);
    const user = await authModel.findOneAndDelete({ _id: userId.id });
    console.log(user);
    if (!user)
      throw new CustomAPIError(
        `The user with the ID: ${id} does not exist`,
        StatusCodes.NOT_FOUND
      );
    return user;
  }

  // update a customer's reords or data in the database
  public static async update_customer_details(
    userId: Partial<UserDataInterface>,
    updateData: UserDataInterface
  ): Promise<UserDataInterface> {
    const { id } = userId;
    validateMongoDbID(id);
    const updateuser = await authModel.findOneAndUpdate(
      { _id: id },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
    console.log(userId);
    if (!updateuser) {
      throw new CustomAPIError(
        `The user with the id: ${id} was not found to be updated`,
        StatusCodes.NOT_FOUND
      );
    }
    return updateuser;
  }

  // block a user or customer account.
  public static async blockUserService(
    User: Partial<UserDataInterface>
  ): Promise<UserDataInterface> {
    const { id } = User;
    validateMongoDbID(id);
    const blockUser = await authModel.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    if (!blockUser) {
      throw new UnauthenticatedError(
        "The User is not avauilable on our database",
        StatusCodes.NO_CONTENT
      );
    } else {
      return blockUser;
    }
  }

  // unblock a user or customer account
  public static async unBlockUserService(
    User: Partial<UserDataInterface>
  ): Promise<UserDataInterface> {
    const { id } = User;
    validateMongoDbID(id);
    const unblockuser = await authModel.findByIdAndUpdate(
      id,
      { isBlocked: false },
      {
        new: true,
      }
    );
    if (!unblockuser)
      throw new UnauthenticatedError(
        "The User is not avauilable on our database",
        StatusCodes.NO_CONTENT
      );
    return unblockuser;
  }

  // Handle refresh token service
  public static async handle_refresh_token_service(cookies: UserDataInterface) {
    const refreshToken = cookies.refreshToken;
    if (!refreshToken) {
      throw new CustomAPIError(
        "There is no refresh token in cookies",
        StatusCodes.NOT_FOUND
      );
    }
    const token = await authModel.findOne({ refreshToken });
    if (!token)
      throw new CustomAPIError(
        "There are no refresh Tokens in cookies",
        StatusCodes.UNAUTHORIZED
      );
    let accessToken;
    try {
      jwt.verify(refreshToken, process.env.JWT_SECRET!, (err, decoded) => {
        const decodeJWT = decoded as IDecoded;
        console.log("decodedData: ", decodeJWT);
        if (err || !decoded || token.id !== decodeJWT.id) {
          throw new CustomAPIError(
            "There is something wrong with the refresh token",
            StatusCodes.NOT_ACCEPTABLE
          );
        }
        accessToken = generateToken(token.id);
      });
    } catch (error) {
      throw new CustomAPIError(
        "Error verifying refresh token",
        StatusCodes.UNAUTHORIZED
      );
    }
    return accessToken;
  }

  // Logout

  public static async LogoutService(
    cookies: string
  ): Promise<UserDataInterface | void> {
    const refreshToken = cookies;

    if (!refreshToken) {
      throw new CustomAPIError(
        "There is no refresh token in cookies",
        StatusCodes.NOT_FOUND
      );
    }
    const token = await authModel.findOne({ refreshToken });

    if (!token) {
      throw new CustomAPIError(
        "There are no refresh token in cookies",
        StatusCodes.UNAUTHORIZED
      );
    }

    try {
      jwt.verify(refreshToken, process.env.JWT_SECRET!, (err, decoded) => {
        const decodeJWT = decoded as IDecoded;
        console.log("decodedData: ", decodeJWT);
        if (err || token.id !== decodeJWT.id) {
          throw new CustomAPIError(
            "There is something wrong with the refresh token",
            StatusCodes.NOT_ACCEPTABLE
          );
        }

        // Assuming we have a blacklistTokens model
        blacklistTokens.create({ token: refreshToken });
      });
    } catch (error) {
      throw new CustomAPIError(
        "Error verifying refresh token",
        StatusCodes.UNAUTHORIZED
      );
    }
  }

  public static async fgtPwdService(
    user_email: string
  ): Promise<UserDataInterface | void> {
    try {
      const user = await authModel.findOne({ email: user_email });

      if (!user) {
        throw new CustomAPIError(
          `We could not find a user with the given email ${user_email}`,
          StatusCodes.NOT_ACCEPTABLE
        );
      }
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      const resetUrl = `http://localhost:4040/api/v1/users/resetPassword/${resetToken}`;
      const message = `We have received a password reset request. 
    Please use the link below to reset your password:\n\n${resetUrl}\n\nThis link expires after 10 minutes.`;
      const subject = "Password reset request received";
      // mailer(user_email, subject, message); // this is another instance that wld need the communication of emailing with rabit mq
    } catch (error) {
      throw new CustomAPIError(
        "Could not reset password",
        StatusCodes.BAD_REQUEST
      );
    }
  }

  public static async resetPwdService(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<UserDataInterface | void> {
    // checking if the user exists with the given token & has not expired.
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await authModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new CustomAPIError(
        "Token is invalid or it has expired!",
        StatusCodes.BAD_REQUEST
      );
    }

    // Resetting the user password
    user.password = newPassword;
    user.confirmPassword = confirmPassword;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    user.passwordChangedAt = new Date(Date.now());

    await user.save();

    return user;
  }  
}
