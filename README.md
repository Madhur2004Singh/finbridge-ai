# FinBridge AI Phase 2 + Phase 3

FinBridge AI is a React/Vite frontend with an Express and MongoDB backend. The current application includes JWT authentication, a survey-derived financial profile, scheme recommendations, expenses, financial literacy content, and blogs.

## Prerequisites

- Node.js 20 or newer and npm
- A MongoDB database that the backend can access
- Cloudinary credentials only if using blog image uploads or whiteboard exports

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Set `MONGO_URI` and a long random `JWT_SECRET` in `backend/.env`. `CLIENT_URL` should point to the frontend origin (default `http://localhost:5173`). Cloudinary settings are optional until image upload features are used. Do not commit `.env` files.

Seed schemes safely and start the API:

```bash
npm run seed
npm run dev
```

The seed command inserts schemes only when their slug is absent and does not delete or overwrite existing records. The API listens on port 5000 by default.

## Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` if the backend API is not at `http://localhost:5000/api`.

## Checks

```bash
cd backend
npm test
npm run check
```

```bash
cd frontend
npm test
npm run build
```

## Database and external services

The backend connects to the MongoDB URI in `MONGO_URI`. Do not run the seed command against a database you do not intend to populate. Cloudinary is only needed for image features; authentication and scheme data require MongoDB.

## Localization

The interface provides English, Hindi, and Kannada navigation strings. The initial 10-scheme dataset has English source text only; scheme details currently fall back to English for Hindi and Kannada. Hindi and Kannada review is needed for the `name`, `description`, `eligibility`, `benefits`, `documentsRequired`, and `applicationSteps` fields of PM-KISAN, PMFBY, KCC, PM-KMY, MGNREGA, PM-SYM/e-Shram, PM SVANidhi, AB-PMJAY, PMSBY/PMJJBY, and PMAY-G.

Existing database rows from older seeds may still have English duplicated in their Hindi/Kannada slots; the safe seed command intentionally does not overwrite them. After reviewed translations are approved, apply them through a separate, reviewed migration that updates only the localized `hi`/`kn` paths by scheme slug. First export or back up the affected records, preview the exact matched slugs and field changes, then run the migration and verify a sample in each locale. Do not delete or reseed the scheme collection to refresh translations. No official rules or benefits are translated without review.
