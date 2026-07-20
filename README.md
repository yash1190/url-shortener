**Live demo:** https://url-shortener-lac-theta.vercel.app

# URL Shortener

A full-stack URL shortening service built with the MERN stack (MongoDB, Express, React, Node.js) in TypeScript designed around read-heavy traffic patterns, with Redis caching, click analytics, JWT authentication, and distributed rate limiting.

## Features

- **Shorten URLs** — collision-resistant 7-character codes generated with nanoid, with a retry-on-duplicate strategy backed by a unique MongoDB index
- **Fast redirects with Redis caching** — cache-aside pattern on the redirect path; hot links are served from Redis without touching the database (1-hour TTL)
- **Click analytics** — every redirect is logged asynchronously (fire-and-forget, so analytics never slows a redirect) and aggregated with MongoDB pipelines: clicks per day and top referrers
- **JWT authentication** — register/login with bcrypt-hashed passwords; stateless auth via signed tokens
- **Per-user link ownership** — authenticated users get a private dashboard; link stats are owner-only
- **Redis-backed rate limiting** — per-route limits (strict on creates, generous on redirects, moderate on auth) with counters stored in Redis so limits survive restarts and work across instances
- **Auto-expiring links** — optional expiry dates enforced by a MongoDB TTL index, no cleanup jobs needed
- **React dashboard** — login, link management, and a stats view with click-over-time charts (Recharts)

## Architecture

```
React (Vite) ──▶ Express API ──▶ Redis (cache + rate-limit counters)
                     │
                     └─────────▶ MongoDB (urls, clicks, users)
```

**The redirect path** (the hot path — redirects vastly outnumber creates):

1. Rate limiter checks the per-IP counter in Redis
2. Cache lookup: `url:{shortCode}` in Redis
   - **Hit** → redirect immediately
   - **Miss** → query MongoDB, populate the cache, then redirect
3. Click logging happens after the redirect fires (async, non-blocking) — a failed analytics write never breaks a redirect

**Key design decisions**

| Decision | Why |
|---|---|
| Cache-aside (lazy) population | Many links are created but never clicked; the cache only holds links that are actually being visited |
| Separate `clicks` collection | Keeps the hot `urls` documents small; analytics reads/writes scale independently |
| Fire-and-forget click logging | The redirect (user-facing) never waits on analytics (best-effort) |
| Rate-limit counters in Redis | In-memory counters reset on restart and break across multiple instances |
| nanoid + unique index + retry | Random generation alone cannot guarantee uniqueness; the DB index is the source of truth |
| TTL index for expiry | MongoDB removes expired links automatically — no scheduled cleanup jobs |

## Tech stack

**Backend:** Node.js, Express, TypeScript, Mongoose (MongoDB Atlas), ioredis (Upstash Redis), jsonwebtoken, bcryptjs, express-rate-limit
**Frontend:** React 18, TypeScript, Vite, React Router, axios, Recharts

## API

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create an account, returns a JWT |
| `POST` | `/api/auth/login` | — | Log in, returns a JWT |
| `POST` | `/api/urls` | optional | Shorten a URL (owned if authenticated, anonymous otherwise) |
| `GET` | `/api/urls/mine` | required | List the authenticated user's links |
| `GET` | `/api/urls/:shortCode/stats` | required (owner) | Click totals, clicks per day, top referrers |
| `GET` | `/:shortCode` | — | Redirect to the original URL |

## Running locally

**Prerequisites:** Node.js 18+, a MongoDB Atlas cluster, an Upstash Redis database (both have free tiers).

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/urlshortener
REDIS_URL=rediss://default:<password>@<your-db>.upstash.io:6379
JWT_SECRET=<a long random string>
BASE_URL=http://localhost:5000
PORT=5000
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## Rate limits

| Route | Limit |
|---|---|
| Create short URL | 10 / hour / IP |
| Auth (register/login) | 20 / 15 min / IP |
| Redirects | 100 / min / IP |

## Roadmap

- Custom aliases and expiry dates exposed in the dashboard UI
- QR code generation per link
- Test suite (Jest + Supertest)
- Deployment (Render + Vercel)
