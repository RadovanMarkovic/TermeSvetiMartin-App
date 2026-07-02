# Smart Guest Quest

Smart Guest Quest is a student MVP web application for a short interactive kiosk game at Terme Sveti Martin.

Guests choose an avatar, activity, meals for the day and a reward, then receive a personalized resort day and anonymous recommendations. The internal dashboard shows anonymous aggregated insights and individual anonymous responses for food planning, guest experience, marketing and operations.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite
- Docker: not used

## Project Structure

```text
App/
  backend/
    src/
      database/
        db.js
        schema.js
        setup.js
      server.js
    package.json
  frontend/
    src/
      data/
      App.jsx
      main.jsx
      styles.css
    index.html
    package.json
    vite.config.js
  README.md
```

## Backend Setup

Open a terminal in the project root, then run:

```bash
cd backend
npm install
npm run dev
```

The backend runs at:

```text
http://localhost:3000
```

The SQLite database is created automatically on backend startup if it does not exist.

Optional manual database setup:

```bash
npm run db:init
```

Backend routes:

```text
GET  http://localhost:3000/api/health
POST http://localhost:3000/api/sessions
GET  http://localhost:3000/api/dashboard
```

## Frontend Setup

Open a second terminal in the project root, then run:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

Open the kiosk game:

```text
http://localhost:5173
```

Open the internal dashboard:

```text
http://localhost:5173/dashboard
```

The dashboard shows:

- total completed sessions
- avatar, food, activity and reward breakdowns
- operational recommendations
- anonymous response table with creation time and selected meals

## Notes

- The app uses anonymous sessions only.
- It does not ask for names, room numbers, email, phone number, photos, login or personal profiles.
- Frontend content is stored in `frontend/src/data` so avatars, activities, foods, rewards and recommendations are easy to edit.
- Use `npm run build` inside `frontend` to create a production build in `frontend/dist`.
