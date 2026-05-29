import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { z } from "zod";
import { db } from "../../db";
import { authLinks } from "../../db/schema";
import { auth } from "../auth";

export const authenticateFromLink = new Elysia().use(auth).get(
  "/auth-links/authenticate",
  async ({ query, signUser, redirect }) => {
    const { token, redirectTo } = query;

    const authLinkFromToken = await db.query.authLinks.findFirst({
      where(fields, { eq }) {
        return eq(fields.token, token);
      },
    });

    if (!authLinkFromToken) {
      throw new Error("Auth link not found");
    }

    const daysSinceAuthLinkCreation = dayjs().diff(
      authLinkFromToken.createdAt,
      "days",
    );

    if (daysSinceAuthLinkCreation > 7) {
      throw new Error("Auth link is expired");
    }

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.managerdId, authLinkFromToken.userId);
      },
    });

    await signUser({
      sub: authLinkFromToken.userId,
      restaurantId: managedRestaurant?.id,
    });

    await db.delete(authLinks).where(eq(authLinks.token, token));

    return redirect(redirectTo);
  },
  {
    query: z.object({
      token: z.string(),
      redirectTo: z.string(),
    }),
  },
);
