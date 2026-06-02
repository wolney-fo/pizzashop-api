import { Elysia } from "elysia";
import { createRestaurant } from "./routes/register-restaurant";
import { sendAuthLink } from "./routes/send-auth-link";
import { authenticateFromLink } from "./routes/authenticate-from-link";
import { signOut } from "./routes/sign-out";
import { getUserProfile } from "./routes/get-user-profile";
import { getManagedRestaurant } from "./routes/get-managed-restaurant";
import { getOrderDetails } from "./routes/get-order-details";
import { approveOrder } from "./routes/approve-order";
import { cancelOrder } from "./routes/cancel-order";
import { deliverOrder } from "./routes/deliver-order";
import { dispatchOrder } from "./routes/dispatch-order";
import { listOrders } from "./routes/list-orders";
import { getMontghRevenue } from "./routes/get-month-revenue";
import { getDayOrdersAmount } from "./routes/get-day-orders-amount";

const app = new Elysia()
  .use(createRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getUserProfile)
  .use(getManagedRestaurant)
  .use(getOrderDetails)
  .use(approveOrder)
  .use(cancelOrder)
  .use(deliverOrder)
  .use(dispatchOrder)
  .use(listOrders)
  .use(getMontghRevenue)
  .use(getDayOrdersAmount);

app.listen(3333, () => {
  console.log("HTTP Server running");
});
