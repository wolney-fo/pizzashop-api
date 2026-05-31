import Elysia from "elysia";
import { auth } from "../auth";
import { z } from "zod";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { db } from "../../db";

export const getOrderDetails = new Elysia().use(auth).get(
  "/orders/:orderId",
  async ({ getCurrentUser, params, set }) => {
    const { orderId } = params;

    const { restaurantId } = await getCurrentUser();

    if (!restaurantId) {
      throw new UnauthorizedError();
    }

    const order = await db.query.orders.findFirst({
      columns: {
        id: true,
        status: true,
        totalInCents: true,
        createdAt: true,
      },
      with: {
        customer: {
          columns: {
            name: true,
            phone: true,
            email: true,
          },
        },
        items: {
          columns: {
            id: true,
            priceInCents: true,
            quantity: true,
          },
          with: {
            product: {
              columns: {
                name: true,
              },
            },
          },
        },
      },
      where(fields, { eq }) {
        return eq(fields.id, orderId);
      },
    });

    if (!order) {
      set.status = 400;

      return { mesage: "Order not found" };
    }

    return order;
  },
  {
    params: z.object({
      orderId: z.string(),
    }),
  },
);
