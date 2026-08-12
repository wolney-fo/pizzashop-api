# Pizza Shop API

A REST API for managing a restaurant's orders, products, and revenue metrics — built as the backend for a restaurant management dashboard (pizza shop scenario). Restaurant managers sign in via passwordless email links, track incoming orders through their full lifecycle, and monitor sales performance through a set of analytics endpoints.

## Features

- **Passwordless authentication** — managers and customers sign in via a magic link sent by email, no passwords stored
- **JWT sessions** delivered as httpOnly cookies
- **Restaurant management** — register a restaurant and its manager in a single request
- **Order lifecycle** — orders move through `pending → processing → deliverying → delivered`, with support for cancellation, listing/filtering, and detail lookup
- **Revenue & sales metrics** — daily revenue in a custom period, monthly revenue, orders per day/month, canceled orders, and top-selling products
- **Type-safe data layer** — schema, queries, and validation all inferred from a single Drizzle ORM schema

## Tech Stack

- [Bun](https://bun.sh) — JavaScript runtime, package manager, and test runner
- [Elysia](https://elysiajs.com) — HTTP server framework
- [Drizzle ORM](https://orm.drizzle.team) — type-safe SQL query builder and migrations
- [PostgreSQL](https://www.postgresql.org) — database
- [Zod](https://zod.dev) — schema validation
- [@elysia/jwt](https://elysiajs.com/plugins/jwt.html) — JWT signing/verification for session cookies
- [Nodemailer](https://nodemailer.com) — sending authentication emails
- [Day.js](https://day.js.org) — date handling for metrics queries

## Data Model

```
users ──< restaurants (manager) ──< products
  │                                      │
  └──< orders >──────────────────────────┘
         │
         └──< order_items
```

- **users** — can be a `manager` (owns a restaurant) or a `customer` (places orders)
- **restaurants** — belongs to a manager, has many products and orders
- **products** — belongs to a restaurant, referenced by order items
- **orders** — placed by a customer against a restaurant, has a status and a list of items
- **order_items** — line items linking an order to a product with quantity/price
- **auth_links** — single-use tokens used for magic-link login

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- [Docker](https://www.docker.com)

### 1. Install dependencies

```bash
bun install
```

### 2. Start the database

```bash
docker compose up -d
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable                                    | Description                                         |
| ------------------------------------------- | --------------------------------------------------- |
| `PORT`                                      | Port the HTTP server listens on (default `3333`)    |
| `NODE_ENV`                                  | `development`, `test`, or `production`              |
| `API_BASE_URL`                              | Base URL of this API, used to build magic-link URLs |
| `AUTH_REDIRECT_URL`                         | Frontend URL to redirect to after authentication    |
| `DATABASE_URL`                              | PostgreSQL connection string                        |
| `JWT_SECRET_KEY`                            | Secret used to sign session JWTs                    |
| `SMTP_SERVER`, `SMTP_USER`, `SMTP_PASSWORD` | SMTP credentials for sending auth link emails       |

### 4. Run database migrations

```bash
bun run db:migrate
```

Optionally, seed the database with fake data:

```bash
bun run db:seed
```

### 5. Start the server

```bash
bun run dev
```

The API will be available at `http://localhost:3333`.

## API Overview

### Auth

| Method | Route                      | Description                                    |
| ------ | -------------------------- | ---------------------------------------------- |
| POST   | `/restaurants`             | Register a new restaurant and its manager      |
| POST   | `/authenticate`            | Send a magic link to the user's email          |
| GET    | `/auth-links/authenticate` | Consume the magic link and sign in             |
| POST   | `/sign-out`                | Clear the session cookie                       |
| GET    | `/me`                      | Get the authenticated user's profile           |
| GET    | `/managed-restaurant`      | Get the restaurant managed by the current user |

### Orders

| Method | Route                       | Description                                                 |
| ------ | --------------------------- | ----------------------------------------------------------- |
| GET    | `/orders`                   | List orders (filterable by customer, id, status, paginated) |
| GET    | `/orders/:orderId`          | Get order details, including items                          |
| PATCH  | `/orders/:orderId/approve`  | Move an order to `processing`                               |
| PATCH  | `/orders/:orderId/dispatch` | Move an order to `deliverying`                              |
| PATCH  | `/orders/:orderId/deliver`  | Move an order to `delivered`                                |
| PATCH  | `/orders/:orderId/cancel`   | Cancel an order                                             |

### Metrics

| Method | Route                                   | Description                                     |
| ------ | --------------------------------------- | ----------------------------------------------- |
| GET    | `/metrics/day-orders-amount`            | Orders received today vs. yesterday             |
| GET    | `/metrics/month-orders-amount`          | Orders received this month vs. last month       |
| GET    | `/metrics/month-canceled-orders-amount` | Orders canceled this month vs. last month       |
| GET    | `/metrics/month-revenue`                | Revenue this month vs. last month               |
| GET    | `/metrics/daily-revenue-in-period`      | Daily revenue over a custom period (max 7 days) |
| GET    | `/metrics/popular-products`             | Top 5 best-selling products                     |

All routes except `/restaurants`, `/authenticate`, and `/auth-links/authenticate` require an authenticated session (JWT cookie), and all restaurant-scoped routes operate only on the restaurant managed by the current user.

## Authentication Flow

1. A manager registers a restaurant via `POST /restaurants`.
2. To sign in, the user requests a magic link via `POST /authenticate` with their email.
3. An email is sent with a link to `GET /auth-links/authenticate?token=...`.
4. Visiting the link validates the token (valid for 7 days), issues a JWT, sets it as an httpOnly cookie, and redirects to `AUTH_REDIRECT_URL`.
5. Subsequent requests are authenticated via that cookie.

## License

MIT by [Wolney Oliveira](https://wolney.dev)
