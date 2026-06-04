import dayjs from "dayjs";
import Elysia from "elysia";
import { auth } from "../auth";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { db } from "../../db";
import { orders } from "../../db/schema";
import { and, count, eq, gte, sql } from "drizzle-orm";

export const getDayOrdersAmount = new Elysia()
  .use(auth)
  .get("/metrics/day-orders-amount", async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser();

    if (!restaurantId) {
      throw new UnauthorizedError();
    }

    const currentMoment = dayjs();
    const yesterday = currentMoment.subtract(1, "day");
    const startOfYesterdy = yesterday.startOf("day");

    const ordersPerDay = await db
      .select({
        dayWithMonthAndYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
        amount: count(),
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startOfYesterdy.toDate()),
        ),
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`);

    const todayWithMonthAndYear = currentMoment.format("YYYY-MM-DD");
    const yesterdarWithMonthAndYear = yesterday.format("YYYY-MM-DD");

    const todayOrdersAmount = ordersPerDay.find((orderPerDay) => {
      return orderPerDay.dayWithMonthAndYear === todayWithMonthAndYear;
    });

    const yesterdayOrdersAmount = ordersPerDay.find((orderPerDay) => {
      return orderPerDay.dayWithMonthAndYear === yesterdarWithMonthAndYear;
    });

    const diffFromYesterday =
      todayOrdersAmount && yesterdayOrdersAmount
        ? (todayOrdersAmount.amount * 100) / yesterdayOrdersAmount.amount
        : null;

    return {
      amount: todayOrdersAmount ? todayOrdersAmount.amount : 0,
      diffFromYesterday: diffFromYesterday
        ? Number((diffFromYesterday - 100).toFixed(2))
        : 0,
    };
  });
