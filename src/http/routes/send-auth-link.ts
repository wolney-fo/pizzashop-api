import Elysia from "elysia";
import { z } from "zod";
import { db } from "../../db";
import { createId } from "@paralleldrive/cuid2";
import { authLinks } from "../../db/schema";
import { env } from "../../env";

export const sendAuthLink = new Elysia().post(
  "/authenticate",
  async ({ body }) => {
    const { email } = body;

    const userFromEmail = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email);
      },
    });

    if (!userFromEmail) {
      throw new Error("User not found");
    }

    const token = createId();

    await db.insert(authLinks).values({
      userId: userFromEmail.id,
      token,
    });

    const authLink = new URL("/auth-links/authenticate", env.API_BASE_URL);

    authLink.searchParams.set("token", token);
    authLink.searchParams.set("redirectTo", env.AUTH_REDIRECT_URL);

    // TODO: send e-mail
    console.log(authLink);
  },
  {
    body: z.object({
      email: z.email(),
    }),
  },
);
