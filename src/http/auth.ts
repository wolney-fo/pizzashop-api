import jwt from "@elysia/jwt";
import Elysia from "elysia";
import { z } from "zod";
import { env } from "../env";

const jwtPayloadSchema = z.object({
  sub: z.string(),
  restaurantId: z.string().optional(),
});

export const auth = new Elysia()
  .use(
    jwt({
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayloadSchema,
    }),
  )
  .derive({ as: "scoped" }, ({ jwt, cookie: { auth } }) => {
    return {
      signUser: async (payload: z.infer<typeof jwtPayloadSchema>) => {
        const token = await jwt.sign(payload);

        auth.set({
          value: token,
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7, // 7 days,
          path: "/",
        });
      },

      signOut: () => {
        auth.remove();
      },

      getCurrentUser: async () => {
        const payload = await jwt.verify(auth.value as string);

        if (!payload) {
          throw new Error("Unauthorized");
        }

        return {
          userId: payload.sub,
          restaurantId: payload.restaurantId,
        };
      },
    };
  });
