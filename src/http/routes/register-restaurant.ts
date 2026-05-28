import Elysia from "elysia";
import { z } from "zod";
import { db } from "../../db";
import { restaurants, users } from "../../db/schema";

export const createRestaurant = new Elysia().post(
  "/restaurants",
  async ({ body, set }) => {
    const { restaurantName, name, email, phone } = body;

    const [manager] = await db
      .insert(users)
      .values({
        name,
        email,
        phone,
        role: "manager",
      })
      .returning({
        id: users.id,
      });

    await db.insert(restaurants).values({
      name: restaurantName,
      managerdId: manager.id,
    });

    set.status = 204;
  },
  {
    body: z.object({
      restaurantName: z.string(),
      name: z.string(),
      email: z.email(),
      phone: z.string(),
    }),
  },
);
