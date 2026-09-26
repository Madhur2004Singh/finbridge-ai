# FinBridge AI Phase 2 + Phase 3

## Run backend
```bash
cd backend
cp .env.example .env
# set MONGO_URI, JWT_SECRET and CLIENT_URL
npm install
npm run seed
npm run dev
```

## Run frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The supplied 10-scheme material is stored in `backend/src/data/schemes.json`. The database schema is multilingual-ready. The starter seeds the supplied source text into all three language slots as a technical placeholder so the UI works immediately; replace these placeholder Hindi/Kannada fields with reviewed translations before your demo/public release.
