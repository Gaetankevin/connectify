"use server";

import {
  SignupFormSchema,
  LoginFormSchema,
  FormState,
} from "./../lib/definitions";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import { type User } from "../../generated/prisma/client";
import { createSession, destroySession } from "../../lib/session";

export async function signup(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    surname: formData.get("surname"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Prepare data for insertion into database
  const { name, surname, username, email, password } = validatedFields.data;
  // e.g. Hash the user's password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);
  //il faudrait retourner l'id du user creer apres son inscription grace a prisma
  const data = await prisma.user.create({
    data: {
      name: name,
      surname: surname,
      username: username,
      email: email,
      passwordHash: hashedPassword,
      roleId: 3,
      createdAt: new Date(),
    },
  });

  const user: User = data;

  if (!user) {
    return {
      message: "An error occurred while creating your account.",
    };
  }
  // create a DB-backed session and set cookie
  try {
    await createSession(user.id);
  } catch (e) {
    // session creation failed — we still return success for account creation,
    // but log or handle as needed. For now, return an error state.
    return { message: "User created but failed to create session." };
  }

  // Return a client-side redirect hint. The client can navigate to `/chat`
  // when it sees this property in the action state.
  return { message: "User created successfully", redirectTo: "/chat" };
}

export async function login(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = LoginFormSchema.safeParse({
    username_email: formData.get("username_email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { username_email, password } = validated.data;

  // find user by username or email
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: username_email }, { email: username_email }],
    },
  });

  if (!user) {
    return { errors: { username_email: ["Invalid username or email"] } };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { errors: { password: ["Invalid password"] } };
  }

  // create session
  try {
    await createSession(user.id);
  } catch (e) {
    return { message: "Logged in but failed to create session." };
  }

  // Return a client-side redirect hint so the UI can navigate to /chat
  return { message: "Logged in successfully", redirectTo: "/chat" };
}

export async function logout() {
  await destroySession();
}
