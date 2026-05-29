import jwt from "@elysia/jwt";
import Elysia from "elysia";
import { z } from "zod";
import { env } from "../env";

export const auth = new Elysia().use(
  jwt({
    secret: env.JWT_SECRET_KEY,
    schema: z.object({
      sub: z.string(),
      restaurantId: z.string().optional(),
    }),
  }),
);
