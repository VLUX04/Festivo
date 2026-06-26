# Festivo

Festivo is a cultural events platform that connects organisers, professionals, and attendees. Users can discover nearby events, follow each other, share moments through a social feed, apply for work opportunities, and chat in real time. Organisers can create and manage events, build guest lists, invite professionals, and view event analytics.

---

## Tech Stack

- **Frontend:** React + Vite, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, WebSocket
- **Database:** PostgreSQL 16
- **Infrastructure:** Docker Compose

---

## Features

- Browse and attend events with proximity-based sorting
- Social feed with likes, comments, shares, and follows
- Real-time chat between users
- Event galleries, reviews, and RSVP management
- Work opportunities — post and apply for event staff roles
- Notifications for social interactions
- Organiser analytics dashboard
- Professional profiles and search

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) 24.0+ with Docker Compose v2
- A modern web browser

No other runtime (Node.js, PostgreSQL, etc.) needs to be installed on the host.

### Installation

Clone the repo and navigate to the website directory:

```bash
git clone <repository-url> festivo
cd festivo/website
```

Configure environment variables in `website/docker-compose.yml` under the `backend` service. At minimum, change the database password and set a `JWT_SECRET`:

```yaml
environment:
  DB_HOST: db
  DB_PORT: 5432
  DB_USER: myuser
  DB_PASSWORD: your-strong-password   # change this
  DB_NAME: mydb
  JWT_SECRET: your-long-random-secret # change this
  PROD: true
```

> Never use the default `secret` password in a public deployment. Generate one with `openssl rand -base64 32`.

Build and start all services:

```bash
docker compose up --build -d
```

This pulls the PostgreSQL image, compiles the backend and frontend, and runs the database initialisation scripts (`schema.sql`, `seed.sql`, `populate.sql`, `triggers.sql`).

Once the containers are up (allow ~90 seconds on first run), open:

- **App:** `http://localhost:5173`
- **API:** `http://localhost:3000`

---

## Running

```bash
# Start
docker compose up -d

# Stop (preserves data)
docker compose down

# View logs
docker compose logs -f

# Restart a single service
docker compose restart backend
```

---

## Database

The database is initialised automatically on first start. To reset it to a clean state:

```bash
docker compose down -v   # WARNING: deletes all data
docker compose up --build -d
```

To apply a schema migration:

```bash
docker compose exec db psql -U myuser -d mydb -f /dev/stdin < database/migrate.sql
```

Always back up before migrating:

```bash
docker compose exec db pg_dump -U myuser mydb > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## Ports

| Service  | Port |
|----------|------|
| Frontend | 5173 |
| Backend  | 3000 |
| Database | 5432 |

---

## Team

LGP-21 — FEUP MEIC | June 2026
