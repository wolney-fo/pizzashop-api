import Elysia from "elysia";
import { auth } from "../auth";
import { db } from "../../db";

export const getUserProfile = new Elysia()
  .use(auth)
  .get("/me", async ({ getCurrentUser }) => {
    const { userId } = await getCurrentUser();

    const user = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, userId);
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  });
