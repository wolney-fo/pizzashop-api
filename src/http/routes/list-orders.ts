import Elysia from "elysia";
import { auth } from "../auth";
import { db } from "../../db";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { orders, orderStatusEnum, users } from "../../db/schema";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";

export const listOrders = new Elysia().use(auth).get(
  "/orders",
  async ({ getCurrentUser, query }) => {
    const { restaurantId } = await getCurrentUser();

    if (!restaurantId) {
      throw new UnauthorizedError();
    }

    const { customerName, orderId, status, pageIndex } = query;

    const baseQuery = db
      .select({
        orderId: orders.id,
        createdAt: orders.createdAt,
        status: orders.status,
        total: orders.totalInCents,
        customerName: users.name,
      })
      .from(orders)
      .innerJoin(users, eq(users.id, orders.customerId))
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          orderId ? ilike(orders.id, `%${orderId}%`) : undefined,
          status ? eq(orders.status, status) : undefined,
          customerName ? ilike(users.name, `%${customerName}%`) : undefined,
        ),
      );

    const [amountOfOrdersQuery, allOrders] = await Promise.all([
      db.select({ count: count() }).from(baseQuery.as("baseQuery")),
      db
        .select()
        .from(baseQuery.as("baseQuery"))
        .offset(pageIndex * 10)
        .limit(10)
        .orderBy((fields) => {
          return [
            sql`CASE ${fields.status}
                WHEN 'pending' THEN 1
                WHEN 'processing' THEN 2
                WHEN 'deliverying' THEN 3
                WHEN 'delivered' THEN 4
                WHEN 'canceled' THEN 99
              END`,
            desc(fields.createdAt),
          ];
        }),
    ]);

    const amountOfOrders = amountOfOrdersQuery[0].count;

    return {
      orders: allOrders,
      meta: {
        pageIndex,
        perPage: 10,
        totalCount: amountOfOrders,
      },
    };
  },
  {
    query: z.object({
      customerName: z.string().optional(),
      orderId: z.string().optional(),
      status: createSelectSchema(orderStatusEnum).optional(),
      pageIndex: z.coerce.number().default(0),
    }),
  },
);
