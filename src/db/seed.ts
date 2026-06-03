import { fakerPT_BR as faker } from "@faker-js/faker";
import { db } from "./index";
import {
  authLinks,
  orderItems,
  orders,
  products,
  restaurants,
  users,
} from "./schema";

async function seed() {
  /**
   * Reset database
   */
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(products);
  await db.delete(authLinks);
  await db.delete(restaurants);
  await db.delete(users);

  console.log("Database reset!");

  /**
   * Create customers
   */
  const customersToInsert = Array.from({ length: 40 }).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number(),
    role: "customer" as const,
  }));

  const customers = await db
    .insert(users)
    .values(customersToInsert)
    .returning();

  console.log("Created customers!");

  /**
   * Create manager
   */
  const [manager] = await db
    .insert(users)
    .values({
      name: faker.person.fullName(),
      email: "admin@admin.com",
      phone: faker.phone.number(),
      role: "manager",
    })
    .returning();

  console.log("Created manager!");

  /**
   * Create restaurant
   */
  const [restaurant] = await db
    .insert(restaurants)
    .values({
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      managerdId: manager.id,
    })
    .returning();

  console.log("Created restaurant!");

  /**
   * Create products
   */
  const productsToInsert = Array.from({ length: 10 }).map(() => ({
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    priceInCents: Number(
      faker.commerce.price({ min: 1000, max: 4000, dec: 0 }),
    ),
    restaurantId: restaurant.id,
  }));

  const createdProducts = await db
    .insert(products)
    .values(productsToInsert)
    .returning();

  console.log("Created products!");

  /**
   * Create orders with order items
   */
  const orderStatuses = [
    "pending",
    "processing",
    "deliverying",
    "delivered",
    "canceled",
  ] as const;

  for (let i = 0; i < 200; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const status = faker.helpers.arrayElement(orderStatuses);
    const selectedProducts = faker.helpers.arrayElements(createdProducts, {
      min: 1,
      max: 4,
    });

    const itemsData = selectedProducts.map((product) => ({
      productId: product.id,
      priceInCents: product.priceInCents,
      quantity: faker.number.int({ min: 1, max: 3 }),
    }));

    const totalInCents = itemsData.reduce(
      (sum, item) => sum + item.priceInCents * item.quantity,
      0,
    );

    const [order] = await db
      .insert(orders)
      .values({
        restaurantId: restaurant.id,
        customerId: customer.id,
        status,
        totalInCents,
        createdAt: faker.date.recent({ days: 90 }),
      })
      .returning();

    await db.insert(orderItems).values(
      itemsData.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        priceInCents: item.priceInCents,
        quantity: item.quantity,
      })),
    );
  }

  console.log("Created orders!");

  console.log("Database seeded successfully!");
}

seed().then(() => {
  process.exit();
});
