import { Elysia } from "elysia";
import { createRestaurant } from "./routes/register-restaurant";
import { sendAuthLink } from "./routes/send-auth-link";
import { authenticateFromLink } from "./routes/authenticate-from-link";
import { signOut } from "./routes/sign-out";
import { getUserProfile } from "./routes/get-user-profile";

const app = new Elysia()
  .use(createRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getUserProfile);

app.listen(3333, () => {
  console.log("HTTP Server running");
});
