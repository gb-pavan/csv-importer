# GrowEasy CSV Importer

GrowEasy CSV Importer turns inconsistent lead-export CSV files into validated CRM records. It provides a responsive Next.js interface for previewing uploads, a cleanly layered Node.js API, and an AI extraction layer that normalizes source data before it is stored in Supabase.

## Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Run locally](#run-locally)
- [Run with Docker](#run-with-docker)
- [Using the application](#using-the-application)
- [Quality checks](#quality-checks)
- [Operations and security](#operations-and-security)

## Architecture

```text
Browser (Next.js) ──multipart CSV──> Express API ──> CSV parser
                                              │
                                              ├──> AI extractor (Gemini, OpenAI, or NVIDIA)
                                              │
                                              └──> Supabase PostgreSQL
```

The backend follows clean architecture boundaries:

- `domain/` contains CRM entities and validation rules.
- `application/` orchestrates parsing, batching, retrying, and importing.
- `infrastructure/` adapts AI providers, Supabase, and the HTTP server.
- `interfaces/` contains transport-level controllers, middleware, and routes.

## Prerequisites

- Node.js 22 LTS (Node.js 18+ is supported for local development)
- npm 10+
- A Supabase project
- An API key for the selected AI provider
- Docker Desktop or Docker Engine with Compose (optional)

## Configuration

Create a local backend environment file. Do not commit it.

```bash
cp backend/.env.example backend/.env
```

Set the following values in `backend/.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `3001`. |
| `AI_PROVIDER` | Yes | `gemini`, `openai`, or `nvidia`. |
| `GEMINI_API_KEY` | For Gemini | Google Gemini API key. |
| `OPENAI_API_KEY` | For OpenAI | OpenAI API key. |
| `NVIDIA_API_KEY` | For NVIDIA | NVIDIA API key. |
| `NVIDIA_MODEL` | For NVIDIA | NVIDIA model identifier. |
| `SUPABASE_URL` | Yes | Supabase project URL. |
| `SUPABASE_ANON_KEY` | Yes | Supabase publishable/anon key used by the API. |

The frontend posts to `http://localhost:3001/api/upload` by default. To use another API endpoint locally, create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=https://api.example.com/api/upload
```

`NEXT_PUBLIC_*` values are embedded into the frontend at build time. Never put private provider or database secrets in them.

### Supabase schema

Create the `leads` table in the Supabase SQL editor:

```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ,
  name TEXT,
  email TEXT,
  country_code TEXT,
  mobile_without_country_code TEXT,
  company TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  lead_owner TEXT,
  crm_status TEXT CHECK (crm_status IN ('GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE', NULL)),
  crm_note TEXT,
  data_source TEXT CHECK (data_source IN ('leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots', NULL)),
  possession_time TEXT,
  description TEXT,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Run locally

Install dependencies once per package:

```bash
cd backend && npm ci
cd ../frontend && npm ci
```

Start the API in one terminal:

```bash
cd backend
npm run dev
```

Start the web application in another:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`. Confirm the API is available with:

```bash
curl http://localhost:3001/health
```

## Run with Docker

Docker Compose builds both services and waits for the API health check before starting the web application.

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

Open `http://localhost:3000`; the API health endpoint is `http://localhost:3001/health`.

To point the Docker-built frontend at a separately hosted API, set `NEXT_PUBLIC_API_URL` in your shell or root `.env` before building:

```bash
NEXT_PUBLIC_API_URL=https://api.example.com/api/upload docker compose up --build
```

Stop the stack with `docker compose down`. Add `--volumes` only if you intentionally want to remove Compose-managed volumes.

## Using the application

1. Upload a UTF-8 CSV file up to 10 MB with a header row and at least one data row.
2. Review the virtualized source preview.
3. Select **Confirm & Extract with AI**.
4. Review imported and skipped records. The **Created At** field is shown in local 12-hour time as `DD-MM-YYYY hh:mm AM/PM`.

The API accepts a multipart request at `POST /api/upload` with the file field named `csv_file`.

## Quality checks

Run these from the relevant package directory:

```bash
# Frontend unit and component tests (Jest + React Testing Library)
cd frontend
npm test

# Browser end-to-end test (Playwright)
npx playwright install chromium # required once per machine
npm run test:e2e

# Frontend static checks and production build
npm run lint
npm run build

# Backend unit and HTTP integration tests (Jest + Supertest)
cd ../backend
npm test
npm run build
```

Tests are intentionally layered: fast unit tests protect domain and UI behavior, integration tests exercise the multipart upload API, and Playwright verifies the complete browser import journey with a mocked API response.

## Operations and security

- Keep `.env` files and all provider keys out of version control. If a key is exposed, revoke and rotate it immediately.
- Set `NEXT_PUBLIC_API_URL` to the public API URL before creating a production frontend build; it cannot be changed after build without rebuilding.
- The API enforces a 10 MB upload limit and permits CSV files only. Deploy behind HTTPS and configure CORS to allow only trusted frontend origins.
- Monitor AI quota, retry rates, import failures, and Supabase errors. The importer retries transient AI failures with exponential backoff and jitter.
- Use least-privilege Supabase credentials and configure Row Level Security policies appropriate to your deployment.

## License

This project is private and proprietary unless a separate license is supplied.
