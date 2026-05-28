import { Elysia } from "elysia";
import { createRestaurant } from "./routes/register-restaurant";

const app = new Elysia().use(createRestaurant);

app.listen(3333, () => {
  console.log("HTTP Server running");
});
