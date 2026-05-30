import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";

export const authLinks = pgTable("auth_links", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  token: text("token").notNull().unique(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const authLinksRelations = relations(authLinks, ({ one }) => ({
  user: one(users, {
    fields: [authLinks.userId],
    references: [users.id],
  }),
}));
