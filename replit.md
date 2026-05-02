# Kumbh360 — Pilgrim Companion

A comprehensive digital companion app for the Kumbh Mela (Nashik/Trimbakeshwar). Helps pilgrims navigate safely with real-time crowd management, AI chat, SOS alerts, and multilingual support.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite, served by the Express server in dev mode
- **Backend**: Express.js (TypeScript) on port 5000 — serves both API routes and the Vite dev middleware
- **Database**: PostgreSQL via Neon Serverless + Drizzle ORM
- **AI**: Google Gemini 1.5 Pro (RAG chatbot, translation, image processing)
- **Real-time**: WebSocket (`ws`) for live crowd density grid updates every 5s
- **Vector search**: FAISS-node + Xenova Transformers for knowledge base embedding/search
- **Caching**: Redis (optional, via `REDIS_URL`); falls back to in-memory when not set

## Key Files

| Path | Purpose |
|------|---------|
| `server/index.ts` | Entry point — initialises cache, vector search, RAG, starts server on `0.0.0.0:5000` |
| `server/routes.ts` | All API routes + WebSocket setup |
| `server/storage.ts` | Database interaction layer (Drizzle ORM) |
| `server/rag-gemini.ts` | RAG pipeline using Gemini |
| `server/vector-search.ts` | FAISS-based vector search |
| `client/src/App.tsx` | Root app component — splash screen, network status, routing |
| `client/src/pages/home.tsx` | App dashboard — greeting, quick actions, live status, widgets |
| `client/src/pages/map.tsx` | Interactive map with crowd heatmap (Leaflet) |
| `client/src/pages/sos.tsx` | Emergency page — SOS composer, transport, safety info |
| `client/src/pages/profile.tsx` | User profile, language, emergency contacts |
| `client/public/sw.js` | Service worker — caching, push notifications, background sync |
| `client/public/manifest.webmanifest` | PWA manifest with shortcuts (SOS, Map, Chat) |

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
| `REDIS_URL` | Redis for caching | Optional (in-memory fallback) |
| `SESSION_SECRET` | Express session secret | Auto-set |

## Development

```bash
npm run dev      # Start dev server (tsx server/index.ts, Vite middleware)
npm run build    # Build client (Vite) + bundle server (esbuild)
npm run db:push  # Apply Drizzle schema to PostgreSQL
```

Server listens on `0.0.0.0:5000` (required for Replit).

## Deployment

- Build command: `npm run build`
- Run command: `node ./dist/index.cjs`
- Target: Autoscale
