# Coy Discover

A mobile-first, swipe-based profile discovery experience built as a standalone Coy assignment project. The **Home** tab is intentionally blank; the **Discover** tab contains the complete discovery and matching experience.

## Features

- 30 seeded mock profiles with name, age, photo, bio, city/college, and interests.
- One profile card at a time, with touch-friendly drag gestures and desktop Like/Pass controls.
- Animated card movement, live LIKE/PASS feedback, and keyboard shortcuts (← pass, → like).
- A profile disappears from the feed as soon as its swipe is successfully saved.
- Mutual matching only: a match is created when the current user likes a profile that has already liked the current user.
- Dedicated Matches view and an “It’s a match!” moment.
- Incoming one-sided likes are never sent in API responses.
- SQLite-backed swipes and matches persist across refreshes and backend restarts.
- Responsive layout, loading/error/empty states, and reduced-motion support.

## Tech stack

- **Frontend:** React 19, Vite, Framer Motion, Lucide React
- **Backend:** Node.js, Express 5
- **Database:** SQLite through better-sqlite3
- **Tests:** Node.js built-in test runner

## Run locally

Requirements: Node.js 20.19+ or 22.12+ (Vite 8 requirement) and npm.

From the repository root:

```bash
npm run install:all
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000
- Health check: http://localhost:5000/health

The backend creates `backend/coy.db` and seeds 30 profiles automatically when the profiles table is empty. The database file is ignored by Git.

### Run services separately

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

### Configure the API URL

The frontend defaults to `http://localhost:5000`. To point it to another API origin, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

The backend accepts `PORT` and `COY_DB_PATH` environment variables. `COY_DB_PATH` is useful for isolated test databases.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | API health check |
| GET | `/feed` | Profiles not yet swiped on |
| POST | `/swipe` | Persist a `like` or `pass` |
| GET | `/matches` | Mutual matches only |

Example swipe request:

```json
{
  "profileId": 1,
  "direction": "like"
}
```

A successful swipe returns `success`, `isMatch`, and a message. A repeated swipe returns HTTP 409; invalid input returns 400; an unknown profile returns 404.

## Demo flow

1. Start the app and open Discover.
2. Drag the first card right or click Like. The first seeded profiles include incoming likes, so a mutual match can be demonstrated immediately.
3. Click **See your matches** to view the mutual match.
4. Return to Discover and pass or like other profiles.
5. Refresh the page: swiped profiles remain excluded and matches remain available.

The seed data intentionally stores incoming likes only on the server. The `liked_current_user` field is not selected by `/feed` or `/matches`; the client only learns about a like after the current user likes that same profile and the backend confirms a mutual match.

## Tests

```bash
npm --prefix backend test
```

The API integration test verifies the 30-profile seed, response privacy, invalid input, missing profiles, duplicate swipe prevention, mutual matching, feed exclusion, and persistence after a simulated backend restart.

## Data model

- `profiles`: seeded profile information plus a server-only `liked_current_user` demo flag.
- `swipes`: one row per profile for the single logged-in-user simulation, with a unique `profile_id`, `direction`, and timestamp.

The single-user schema is intentional and matches the assignment (no external authentication). A production multi-user product would need user identities and a unique pair of swiper/target IDs; that complexity is deliberately out of scope here.
