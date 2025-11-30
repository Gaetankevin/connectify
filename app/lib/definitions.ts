import * as z from "zod";
export const SignupFormSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long" })
      .max(50, { message: "Name must be at most 50 characters long" })
      .trim(),
    surname: z
      .string()
      .min(2, { message: "Surname must be at least 2 characters long" })
      .max(50, { message: "Surname must be at most 50 characters long" })
      .trim(),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" })
      .max(30, { message: "Username must be at most 30 characters long" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores.",
      })
      .trim(),
    email: z.email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
      .regex(/[0-9]/, { message: "Contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Contain at least one special character.",
      })
      .trim(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterFormState =
  | {
      errors?: {
        name?: string[];
        surname?: string[];
        username?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
      message?: string;
    }
  | undefined;
export const LoginFormSchema = z.object({
  username_email: z.string().min(1, { message: "Username or email is required" }).trim(),
  password: z.string().min(1, { message: "Password is required" }).trim(),
})

export type FormState =
  | {
      errors?: {
        [key: string]: string[] | undefined;
      };
      message?: string;
      // optional client-side redirect hint. When returned by server actions
      // the client can navigate to this path (e.g. '/chat') after success.
      redirectTo?: string;
    }
  | undefined