import { Elysia } from "elysia";
import { createRestaurant } from "./routes/register-restaurant";
import { sendAuthLink } from "./routes/send-auth-link";

const app = new Elysia().use(createRestaurant).use(sendAuthLink);

app.listen(3333, () => {
  console.log("HTTP Server running");
});
