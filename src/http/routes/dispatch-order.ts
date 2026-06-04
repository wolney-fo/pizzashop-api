import Elysia from "elysia";
import { auth } from "../auth";
import { z } from "zod";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { db } from "../../db";
import { orders } from "../../db/schema";
import { eq } from "drizzle-orm";

export const dispatchOrder = new Elysia().use(auth).patch(
  "/orders/:orderId/dispatch",
  async ({ getCurrentUser, params, set }) => {
    const { orderId } = params;

    const { restaurantId } = await getCurrentUser();

    if (!restaurantId) {
      throw new UnauthorizedError();
    }

    const order = await db.query.orders.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, orderId),
          eq(fields.restaurantId, restaurantId),
        );
      },
    });

    if (!order) {
      set.status = 400;

      return { message: "Order not found" };
    }

    if (order.status !== "processing") {
      set.status = 400;

      return { message: "Order is not processing" };
    }

    await db
      .update(orders)
      .set({
        status: "deliverying",
      })
      .where(eq(orders.id, orderId));
  },
  {
    params: z.object({ orderId: z.string() }),
  },
);
