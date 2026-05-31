import Elysia from "elysia";
import { auth } from "../auth";
import { z } from "zod";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { db } from "../../db";
import { orders } from "../../db/schema";
import { eq } from "drizzle-orm";

export const cancelOrder = new Elysia().use(auth).patch(
  "/orders/:orderId/cancel",
  async ({ getCurrentUser, params, set }) => {
    const { orderId } = params;

    const { restaurantId } = await getCurrentUser();

    if (!restaurantId) {
      throw new UnauthorizedError();
    }

    const order = await db.query.orders.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, orderId);
      },
    });

    if (!order) {
      set.status = 400;

      return { message: "Order not found" };
    }

    if (!["pending", "processing"].includes(order.status)) {
      set.status = 400;

      return { message: "Order can not be canceled" };
    }

    await db
      .update(orders)
      .set({
        status: "canceled",
      })
      .where(eq(orders.id, orderId));
  },
  {
    params: z.object({ orderId: z.string() }),
  },
);
