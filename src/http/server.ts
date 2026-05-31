import { Elysia } from "elysia";
import { createRestaurant } from "./routes/register-restaurant";
import { sendAuthLink } from "./routes/send-auth-link";
import { authenticateFromLink } from "./routes/authenticate-from-link";
import { signOut } from "./routes/sign-out";
import { getUserProfile } from "./routes/get-user-profile";
import { getManagedRestaurant } from "./routes/get-managed-restaurant";
import { getOrderDetails } from "./routes/get-order-details";

const app = new Elysia()
  .use(createRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getUserProfile)
  .use(getManagedRestaurant)
  .use(getOrderDetails);

app.listen(3333, () => {
  console.log("HTTP Server running");
});
