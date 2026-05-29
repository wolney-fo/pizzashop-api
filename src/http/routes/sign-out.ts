import Elysia from "elysia";

export const signOut = new Elysia().post(
  "/sign-out",
  ({ cookie: { auth } }) => {
    auth.remove();
  },
);
