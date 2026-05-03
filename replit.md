# Kumbh360 — Pilgrim Companion

A comprehensive digital companion PWA for the Kumbh Mela (Nashik/Trimbakeshwar). Helps pilgrims navigate safely with real-time crowd management, AI chat, SOS alerts, and multilingual support.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite, served by the Express server in dev mode
- **Backend**: Express.js (TypeScript) on port 5000 — serves both API routes and the Vite dev middleware
- **Database**: PostgreSQL via Neon Serverless + Drizzle ORM
- **AI**: Google Gemini 1.5 Pro (RAG chatbot, translation, image processing)
- **Real-time**: WebSocket (`ws`) at `/ws` with token auth — live H3 crowd density every 5s
- **Crowd mapping**: H3 resolution-9 hexagons (174 m²) aggregating real GPS pings via `POST /api/location-ping`
- **Vector search**: FAISS-node + Gemini embeddings for knowledge base search
- **Caching**: Redis (optional, via `REDIS_URL`); falls back to in-memory when not set

## Key Files

| Path | Purpose |
|------|---------|
| `server/index.ts` | Entry point — initialises cache, vector search, RAG, starts server on `0.0.0.0:5000` |
| `server/routes.ts` | All API routes + WebSocket (token-auth) setup |
| `server/storage.ts` | In-memory storage — H3 crowd aggregation, lost-found, location pings |
| `server/crowd-predictor.ts` | Time-of-day + event-aware crowd level prediction |
| `server/rag-gemini.ts` | RAG pipeline using Gemini |
| `server/vector-search.ts` | FAISS-based vector search (in-memory, Gemini embeddings) |
| `shared/schema.ts` | Drizzle schema: all tables including locationPings + lostFoundItems |
| `migrations/` | Drizzle migration SQL files (use `npx tsx scripts/migrate.ts` for prod) |
| `scripts/migrate.ts` | Safe migration runner — use this instead of db:push in production |
| `client/src/App.tsx` | Root app component — splash screen, network status, routing |
| `client/src/pages/home.tsx` | App dashboard — greeting, quick actions, live status, widgets |
| `client/src/pages/map.tsx` | Interactive map with crowd heatmap (Leaflet + H3 hex data) |
| `client/src/pages/sos.tsx` | Emergency page — SOS composer, transport, safety info |
| `client/src/pages/profile.tsx` | User profile, language, emergency contacts |
| `client/public/sw.js` | Service worker — caching, push notifications, background sync |
| `client/public/manifest.webmanifest` | PWA manifest with shortcuts (SOS, Map, Chat) |

## Security

- **WebSocket auth**: Server generates a `WS_TOKEN` on startup. Frontend fetches it via `GET /api/ws-token` then connects with `?token=<value>`. Unauthenticated WS connections are closed with code 4001.
- **Rate limiting**: `POST /api/nlp/query` is limited to 20 requests/minute per IP via `express-rate-limit`.
- **Location ping validation**: `POST /api/location-ping` rejects coordinates outside the Nashik/Trimbak bounding box.

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/ws-token` | Fetch WebSocket auth token |
| POST | `/api/location-ping` | Record pilgrim GPS ping → H3 hex aggregation |
| GET | `/api/crowd/h3-hexes` | Get H3 crowd hexagon data |
| GET | `/api/lost-found` | List lost & found items (filter by `?type=lost\|found`) |
| POST | `/api/lost-found` | Report a lost or found item |
| PATCH | `/api/lost-found/:id/resolve` | Mark a lost/found item as resolved |
| POST | `/api/nlp/query` | AI chatbot query (rate-limited: 20/min) |
| GET | `/api/crowd-levels` | Crowd levels for all key locations |
| GET | `/api/density-grid` | H3-based crowd density grid |
| GET | `/api/facilities` | All facilities |
| GET | `/api/emergency-contacts` | Emergency contacts |
| POST | `/api/sos-message` | Send SOS via Twilio |

## PWA / App Features

- **Splash screen** — branded orange launch screen on every fresh load
- **Install prompt** — "Add to home screen" banner on the dashboard
- **Offline shell** — service worker caches app shell; `offline.html` shown when offline
- **Push notifications** — service worker handles push events + notification clicks
- **Background sync** — tag `sync-sos` re-attempts queued SOS messages when back online
- **PWA shortcuts** — long-press icon to jump to SOS, Map, or Chat
- **Haptic feedback** — `useHaptics` hook uses Vibration API on nav taps and SOS actions
- **Pull-to-refresh** — `usePullToRefresh` with animated spinner indicator
- **Network status banner** — `NetworkStatus` component shows online/offline state
- **Native Share** — Web Share API in header; falls back to clipboard copy

## Environment Variables (Secrets)

| Key | Purpose | Required |
|-----|---------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes (auto-set) |
| `GEMINI_API_KEY` | Google Gemini — AI chatbot, translation, image processing | Yes for AI features |
| `OPENWEATHER_API_KEY` | Real weather for Nashik/Trimbakeshwar | Optional (mock fallback) |
| `NEWSAPI_KEY` | Live Kumbh Mela news | Optional (mock fallback) |
| `TWILIO_ACCOUNT_SID` | Twilio SID — SOS SMS alerts | Optional |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Optional |
| `TWILIO_PHONE_NUMBER` | Twilio sender number | Optional |
| `REDIS_URL` | Redis for caching + sessions | Optional (in-memory fallback) |

## Development

```bash
npm run dev      # Start dev server (tsx server/index.ts, Vite middleware)
npm run build    # Build client (Vite) + bundle server (esbuild)

# Database (SAFE — use migrations not db:push in production):
npx tsx scripts/migrate.ts   # Apply pending migrations
npx drizzle-kit generate     # Generate migration from schema changes
# DO NOT use npm run db:push in production — it can destructively alter tables
```

Server listens on `0.0.0.0:5000` (required for Replit).

## Deployment

- Build command: `npm run build`
- Run command: `node ./dist/index.cjs`
- Target: Autoscale

## UI / Design System

All five pages have been fully redesigned to match the Kumbh360 brand:

| Page | Hero gradient | Key sections |
|------|--------------|-------------|
| Home | Orange `#FF7F00 → #FF6B00` | Greeting, status pills, next Snan banner, quick actions (4-col), live status bar, Snan schedule scroll, KumbhDoot AI button, news/transport/weather/crowd/accommodation/food/community widgets |
| Map | Sky blue `sky-600 → blue-700` | Street View / Lost & Found pills, Leaflet map with heatmap, safety zones, density grid, area zone filter chips |
| SOS | Red `red-500 → rose-700` | Share location / Send SOS alert CTAs, emergency numbers grid (100/108/101/1078), GPS+contacts+control badges, live safety suggestion banner, emergency transport hub |
| Explore | Violet `violet-600 → purple-700` | 3×3 feature grid with badge overlays (Tap to flip / Today / Live / Emergency) |
| Profile | Violet `violet-600 → purple-700` | PWA Ready / SOS Enabled / language pills, language tabs, theme settings |

Components updated:
- `BottomNav.tsx` — glass-blur backing, pulsing SOS indicator, motion layout
- `SplashScreen.tsx` — 140° orange gradient, decorative rings, tagline; `?nosplash=1` param bypasses it
- `WeatherWidget.tsx` — modern gradient card (sky→blue), temp + 3 stat row
- `RealTimeSafetySuggestion.tsx` — always visible, 8 rotating tips with warning/info/safe levels, 12s auto-rotate, progress dots
- `CrowdLevel.tsx` — header and tab accent color updated to orange brand (`#FF7F00`)
- `MobileLayout.tsx`, `DesktopLayout.tsx`, `SidebarNav.tsx` — refined backgrounds and brand block

## Known Remaining Items

- **FAISS → pgvector**: Vector search still uses in-memory FAISS (rebuilds on restart). Migrate to `pgvector` Neon extension for persistence across restarts.
- **Sessions**: No express-session middleware configured. If user sessions are needed, add `connect-redis` with `REDIS_URL`.
- **Map visualization**: Crowd data is now H3-based. Map rendering layer still uses Leaflet; upgrading to MapLibre GL + deck.gl `H3HexagonLayer` is the next visual step.
- **@xenova/transformers + uber-api packages**: Source code imports removed; packages still in node_modules but not loaded at runtime. Will be cleaned on next `npm install` from scratch.
