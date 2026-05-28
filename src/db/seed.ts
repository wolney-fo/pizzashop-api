import { fakerPT_BR as faker } from "@faker-js/faker";
import { db } from "./index";
import { restaurants, users } from "./schema";

async function seed() {
  /**
   * Reset database
   */
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

  await db.insert(users).values(customersToInsert);

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
  await db.insert(restaurants).values({
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    managerdId: manager.id,
  });

  console.log("Created restaurant!");

  console.log("Database seeded successfully!");
}

seed().then(() => {
  process.exit();
});
