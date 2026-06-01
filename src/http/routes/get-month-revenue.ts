import Elysia from "elysia";
import { auth } from "../auth";
import { UnauthorizedError } from "../errors/unauthorized-error";
import dayjs from "dayjs";
import { db } from "../../db";
import { orders } from "../../db/schema";
import { and, eq, gte, sql, sum } from "drizzle-orm";

export const getMontghRevenue = new Elysia()
  .use(auth)
  .get("/metricts/month-revenue", async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser();

    if (!restaurantId) {
      throw new UnauthorizedError();
    }

    const currentMoment = dayjs();
    const lastMonth = currentMoment.subtract(1, "month");
    const startOfLastMonth = lastMonth.startOf("month");

    const monthsRevenue = await db
      .select({
        monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        revenue: sum(orders.totalInCents).mapWith(Number),
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startOfLastMonth.toDate()),
        ),
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`);

    const lastMonthWithYear = lastMonth.format("YYYY-MM");
    const currentMonthWithYear = currentMoment.format("YYYY-MM");

    const currentMonthRevenue = monthsRevenue.find((monthRevenue) => {
      return monthRevenue.monthWithYear === currentMonthWithYear;
    });

    const lastMonthRevenue = monthsRevenue.find((monthRevenue) => {
      return monthRevenue.monthWithYear === lastMonthWithYear;
    });

    const diffFromLastMonth =
      currentMonthRevenue && lastMonthRevenue
        ? (currentMonthRevenue.revenue * 100) / lastMonthRevenue.revenue
        : null;

    return {
      revenue: currentMonthRevenue ? currentMonthRevenue.revenue : 0,
      diffFromLastMonth: diffFromLastMonth
        ? Number((diffFromLastMonth - 100).toFixed(2))
        : 0,
    };
  });
