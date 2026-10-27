# Traffic Signal Management System - Backend

REST API for storing and retrieving traffic signal configurations. Built with Node.js, Express, TypeScript and PostgreSQL.

The frontend lives in a separate repository: **Traffic-Signal-Frontend**.

## Tech stack

- Node.js, Express 5, TypeScript
- PostgreSQL 16 (run through Docker) using the `pg` driver
- `tsx` for running TypeScript in development

## Prerequisites

- Node.js 20 or newer and npm
- Docker Desktop (or any PostgreSQL server, see [Using your own PostgreSQL](#using-your-own-postgresql))

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file by copying the example:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell use `Copy-Item .env.example .env`.

   The defaults already match `docker-compose.yml`:

   ```
   PORT=5000
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_USER=deval
   DB_PASSWORD=deval_traffic_2026
   DB_NAME=traffic_signal_db
   ```

3. Start PostgreSQL in Docker (make sure Docker Desktop is running):

   ```bash
   docker compose up -d
   ```

   Check that it is up with `docker compose ps`.

4. Create the tables (migration):

   ```bash
   npm run migrate
   ```

5. Insert the default data (seeder):

   ```bash
   npm run seed
   ```

6. Start the API in development mode:

   ```bash
   npm run dev
   ```

   The server runs at `http://localhost:5000`. You should see `PostgreSQL connected` and `Server running on http://localhost:5000` in the console.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Starts the server with auto-reload (`tsx watch`) |
| `npm run build` | Compiles TypeScript to `dist/` |
| `npm start` | Runs the compiled server from `dist/` |
| `npm run migrate` | Runs every new `.sql` file in `migrations/` |
| `npm run seed` | Inserts default configurations (existing rows are not overwritten) |

`migrate` and `seed` run through `tsx`, so use them with `npm run`, not from `dist/`.

## API

Base URL: `http://localhost:5000/api`

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Checks that the server and database are up |
| GET | `/configurations` | Returns all saved configurations |
| GET | `/configurations/:type` | Returns one configuration (404 if none is saved) |
| PUT | `/configurations/:type` | Creates or updates a configuration |

`:type` is one of:

| Type | Signals |
|---|---|
| `three_way` | 3 |
| `four_way_type1` | 4 |
| `four_way_type2` | 4 |
| `five_way` | 5 |

There is also a plain `GET /` route that returns `Traffic Signal API is running`.

### Example

```bash
curl -X PUT http://localhost:5000/api/configurations/three_way \
  -H "Content-Type: application/json" \
  -d '{"signalTimes": [30, 25, 20]}'
```

Response:

```json
{
  "data": {
    "id": 1,
    "intersectionType": "three_way",
    "signalTimes": [30, 25, 20],
    "emergencyTime": 30,
    "createdAt": "2026-10-27T07:47:45.282Z",
    "updatedAt": "2026-10-27T07:47:45.282Z"
  }
}
```

### Validation

- `signalTimes` must be an array with exactly the number of signals for that type (3, 4, 4 or 5).
- Each value must be a whole number from 1 to 600 (seconds).
- An unknown `:type` returns `400`.
- Errors are returned as `{ "error": "message" }`.

`emergencyTime` is fixed at 30 seconds, as required by the task.

## Database

One table, `signal_configurations`:

| Column | Type | Notes |
|---|---|---|
| `id` | serial | Primary key |
| `intersection_type` | varchar(30) | Unique, one of the four types |
| `signal_times` | integer[] | Seconds for each signal, in order |
| `emergency_time` | integer | Default 30 |
| `created_at`, `updated_at` | timestamptz | |

Each intersection type has at most one row, so `PUT` updates the existing row.

Migrations are plain SQL files in `migrations/`. `scripts/migrate.ts` runs them in file-name order and records each one in a `schema_migrations` table, so running `npm run migrate` twice is safe.

### Seed data

| Type | Signal times (seconds) |
|---|---|
| `three_way` | 30, 25, 20 |
| `four_way_type1` | 30, 25, 20, 15 |
| `four_way_type2` | 20, 20, 20, 20 |
| `five_way` | 30, 25, 20, 15, 10 |

There is no login in this task, so there are no seeded user credentials. The only credentials are the database ones in `.env`.

### Looking at the data

Open a SQL shell in the container:

```bash
docker exec -it traffic-signal-db psql -U deval -d traffic_signal_db
```

Then run these one at a time:

```
\dt
SELECT * FROM signal_configurations;
\q
```

Or open `http://localhost:5000/api/configurations` in a browser.

## Project structure

```
backend/
  config/         database connection (pg pool)
  routes/         URL routes (health, configurations)
  controllers/    read the request and send the response
  services/       validation and business rules
  models/         SQL queries
  middleware/     404 and error handling
  utils/          small helpers (HttpError)
  migrations/     SQL migration files
  scripts/        migration runner
  seeders/        seed script
  docker-compose.yml
  index.ts        app entry point
```

A request goes through route, controller, service, then model.

## Using your own PostgreSQL

If you do not want Docker, create a database and put its details in `.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`). Then run `npm run migrate`, `npm run seed` and `npm run dev` as above.

## Troubleshooting

- **`ECONNREFUSED 127.0.0.1:5432`**: PostgreSQL is not running. Start Docker Desktop and run `docker compose up -d`.
- **`relation "signal_configurations" does not exist`**: run `npm run migrate`.
- **Password errors after changing `.env`**: the database user and password are set the first time the Docker volume is created. Run `docker compose down -v` (this deletes the data), then `docker compose up -d`, `npm run migrate` and `npm run seed` again.
- **CORS errors in the browser**: the API only allows requests from `http://localhost:5173`, the default Vite port.

## Assumptions

- One saved configuration per intersection type, and saving again replaces it.
- Signal times are whole seconds between 1 and 600.
- The emergency time is always 30 seconds.

## Architecture notes

<!-- Add your own architectural choices and the reasoning behind them here. -->

## Time log

- Start: <!-- fill in -->
- End: <!-- fill in -->
