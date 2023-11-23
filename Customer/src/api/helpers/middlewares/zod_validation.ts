import { Request, Response, NextFunction } from "express";
import { z, AnyZodObject } from "zod";

export const authSchema = z.object({
  body: z.object({
    firstName: z.string({
      required_error: "customer first name is required",
      invalid_type_error: "customer first name must be a string",
    }),
    lastName: z.string({
      required_error: "customer last name is required",
      invalid_type_error: "customer last name must be a string",
    }),
    email: z
      .string({
        required_error: "customer email is required",
        invalid_type_error: "customer email must be a string",
      })
      .email("Not a valid email address"),
    mobileNumber: z.string({
      required_error: "customer number is required",
      invalid_type_error: "customer number must be a string",
    }),
    password: z.string({
      required_error: "password is required",
      invalid_type_error: "password must be a string",
    }),
    confirmPassword: z.string({
      required_error: "the same password is required to be confirmed",
      invalid_type_error: "required password must be a string",
    }),
  }),
});

export const validate =
  (authSchema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authSchema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
