import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { restaurants } from "./restaurants";
import { users } from "./user";
import { orderItems } from "./order-items";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "deliverying",
  "delivered",
  "canceled",
]);

export const orders = pgTable("orders", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  restaurantId: text("restaurant_id").references(() => restaurants.id, {
    onDelete: "set null",
  }),
  customerId: text("customer_id").references(() => users.id, {
    onDelete: "set null",
  }),
  status: orderStatusEnum("status").notNull().default("pending"),
  totalInCents: integer("total_in_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  customer: one(users, {
    fields: [orders.restaurantId],
    references: [users.id],
  }),
  items: many(orderItems),
}));
