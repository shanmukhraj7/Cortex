# Cortex — AI-Powered Personal Knowledge Base

> Write, organise, and retrieve notes using natural language — powered by a two-stage semantic ML pipeline.

[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.4-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-teal?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Go](https://img.shields.io/badge/Go-1.23-00ADD8?logo=go)](https://go.dev/)
[![Gin](https://img.shields.io/badge/Gin-1.10.0-00ADD8?logo=go)](https://gin-gonic.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3.1-646CFF?logo=vite)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docs.docker.com/compose/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20+%20pgvector-4169E1?logo=postgresql)](https://github.com/pgvector/pgvector)
[![Redis](https://img.shields.io/badge/Redis-7--alpine-DC382D?logo=redis)](https://redis.io/)

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Services](#services)
  - [API Gateway](#api-gateway-port-8080)
  - [Auth Service](#auth-service-port-8081)
  - [Notes Service](#notes-service-port-8082)
  - [Settings Service](#settings-service-port-8083)
  - [ML Service](#ml-service-port-8001)
  - [Frontend](#frontend-port-5173)
- [ML Pipeline](#ml-pipeline)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Run with Docker Compose](#run-with-docker-compose-recommended)
  - [Run Locally (Dev)](#run-locally-dev-mode)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)

---

## Overview

Cortex is a full-stack, polyglot microservices knowledge base. Users create and manage notes that are automatically embedded into a vector database using a locally-served bi-encoder model (`BAAI/bge-large-en-v1.5`). Retrieval is powered by a **two-stage pipeline**:

1. **Stage 1 — Bi-Encoder + pgvector**: Fast approximate nearest-neighbour search using 1024-dimensional embeddings stored in PostgreSQL with the `pgvector` extension.
2. **Stage 2 — Cross-Encoder Reranking**: Precise relevance scoring of the top-20 candidates using `cross-encoder/ms-marco-MiniLM-L-6-v2`, returning only the most relevant results.

A dedicated **Settings Service** (Go / Gin) manages user preferences and account lifecycle — including atomic account deletion — backed by JSONB storage and embedded SQL migrations.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser / Client                        │
│   React 18.3.1 + Vite 5.3.1  (built by node:20-alpine,         │
│                                served by nginx:1.27-alpine)      │
│                                port 5173                         │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP / REST
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway  (port 8080)                    │
│            Spring Cloud Gateway 2023.0.1 · WebFlux (Reactive)   │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │  JwtAuthFilter   │    │       RateLimitFilter             │   │
│  │ (validates JWT,  │    │  (Bucket4j 8.10.1 token-bucket   │   │
│  │  injects userId  │    │   state backed by Redis via       │   │
│  │  as X-User-Id)   │    │   Lettuce reactive client)        │   │
│  └──────────────────┘    └──────────────────────────────────┘   │
│                                                                  │
│  Routes:  /auth/**     → auth-service     (port 8081)            │
│           /notes/**    → notes-service    (port 8082)            │
│           /search/**   → notes-service    (port 8082)            │
│           /settings/** → settings-service (port 8083)            │
└──────────┬──────────────────┬───────────────────────┬───────────┘
           │                  │                        │
           ▼                  ▼                        ▼
┌────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  Auth Service  │  │   Notes Service       │  │  Settings Service    │
│  (port 8081)   │  │   (port 8082)         │  │  (port 8083)         │
│  Spring Boot   │  │   Spring Boot MVC     │  │  Go 1.23 + Gin 1.10  │
│  3.2.4/Java 21 │  │   3.2.4 / Java 21     │  │                      │
│                │  │                       │  │  SettingsHandler     │
│  - Register    │  │  NoteController       │  │  AccountHandler      │
│  - Login       │  │  SearchController     │  │  DangerHandler       │
│  - JWT issue   │  │                       │  │                      │
│                │  │  NoteService          │  │  PostgreSQL (JSONB)  │
│  PostgreSQL    │  │  (Redis @Cacheable,   │  │  + golang-migrate    │
│  + Flyway      │  │   Lettuce pool)       │  │  + sqlx + lib/pq     │
│  + jjwt 0.12.5 │  │  SearchService        │  │  + bcrypt            │
│  + SpringDoc   │  │  MLServiceClient      │  │  + embed.FS          │
└────────────────┘  │  (Spring RestClient)  │  └──────────────────────┘
                    │                       │
                    │  Resilience4j CBs:    │
                    │   ml-embed (10s/10s)  │
                    │   ml-search (12s/15s) │
                    └──────────┬────────────┘
                               │
                               ▼
                    ┌─────────────────────────────┐
                    │   ML Service  (port 8001)    │
                    │   FastAPI 0.115.0 + Uvicorn  │
                    │   Python 3.11+               │
                    │                              │
                    │  POST /embed                 │
                    │  POST /search                │
                    │  GET  /health                │
                    │  GET  /docs   (Swagger UI)   │
                    │  GET  /redoc                 │
                    │                              │
                    │  BiEncoder                   │
                    │  BAAI/bge-large-en-v1.5      │
                    │  1024-dim · L2-norm           │
                    │                              │
                    │  CrossEncoder Reranker        │
                    │  ms-marco-MiniLM-L-6-v2      │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │  PostgreSQL 16 + pgvector    │
                    │  pgvector/pgvector:pg16       │
                    │  - users table               │
                    │  - notes table               │
                    │  - user_settings table       │
                    │  - embedding column          │
                    │    (vector 1024)             │
                    │  Flyway migrations           │
                    │  (auth-service, notes-service│
                    │  golang-migrate (settings)   │
                    └─────────────────────────────┘

                    ┌─────────────────────────────┐
                    │  Redis 7-alpine              │
                    │  - Rate limiting (Bucket4j   │
                    │    via API Gateway)          │
                    │  - Notes cache               │
                    │    (Spring Cache, 10 min TTL │
                    │     Lettuce pool max-act: 8) │
                    └─────────────────────────────┘
```

---

## Project Structure

```
Cortex/
├── docker-compose.yml            # Full-stack local dev orchestration
├── docker-compose.prod.yml       # Production deployment (image refs via GITHUB_OWNER)
├── .env.example                  # Environment variable template
│
├── api-gateway/                  # Spring Cloud Gateway (port 8080)
│   ├── Dockerfile
│   ├── pom.xml                   # Spring Cloud 2023.0.1, Bucket4j 8.10.1, jjwt 0.12.5
│   └── src/main/java/com/cortex/gateway/
│       ├── GatewayApplication.java
│       ├── JwtAuthFilter.java          # JWT validation + X-User-Id header injection
│       ├── RateLimitFilter.java        # Bucket4j token-bucket rate limiter (Redis-backed)
│       └── config/
│           ├── CorsConfig.java
│           ├── GatewayConfig.java      # Route definitions
│           ├── RedisConfig.java
│           └── SecurityConfig.java
│
├── auth-service/                 # Authentication microservice (port 8081)
│   ├── Dockerfile
│   ├── pom.xml                   # Spring Boot 3.2.4, jjwt 0.12.5, Flyway 10.10.0
│   │                             # SpringDoc OpenAPI 2.3.0, Testcontainers 1.19.8
│   └── src/main/java/com/cortex/auth/
│       ├── AuthApplication.java
│       ├── controller/
│       │   └── AuthController.java     # POST /auth/register, POST /auth/login
│       ├── entity/
│       │   └── User.java
│       ├── repository/
│       │   └── UserRepository.java
│       ├── security/
│       │   ├── JwtService.java         # jjwt 0.12.5 — sign & validate HS256 tokens
│       │   └── SecurityConfig.java
│       ├── service/
│       │   └── AuthService.java
│       └── exception/
│           └── GlobalExceptionHandler.java
│
├── notes-service/                # Notes CRUD + search proxy (port 8082)
│   ├── Dockerfile
│   ├── pom.xml                   # Spring Boot 3.2.4, Resilience4j, Lombok, pgvector 0.1.4
│   │                             # Flyway 10.10.0, Testcontainers 1.19.8
│   └── src/main/java/com/cortex/notes/
│       ├── NotesApplication.java
│       ├── controller/
│       │   ├── NoteController.java     # CRUD: /notes/**
│       │   └── SearchController.java   # Semantic search: POST /search
│       ├── service/
│       │   ├── NoteService.java        # Business logic + @Cacheable Redis caching
│       │   └── SearchService.java      # Delegates to MLServiceClient
│       ├── client/
│       │   └── MLServiceClient.java    # Spring RestClient → ml-service
│       ├── entity/
│       │   └── Note.java               # id, userId, title, content, tags, timestamps
│       ├── repository/
│       │   └── NoteRepository.java
│       ├── dto/
│       │   ├── request/
│       │   │   ├── NoteRequest.java
│       │   │   └── SearchRequest.java
│       │   └── response/
│       │       ├── NoteResponse.java
│       │       ├── PagedNotesResponse.java
│       │       ├── SearchResponse.java
│       │       └── SearchResultItem.java
│       ├── security/
│       │   ├── JwtContextFilter.java   # Reads X-User-Id header from gateway
│       │   └── UserContext.java
│       ├── config/
│       │   ├── CorsConfig.java
│       │   ├── RedisConfig.java        # Lettuce pool + per-cache TTL config
│       │   ├── ResilienceConfig.java   # Resilience4j circuit breaker beans
│       │   └── SecurityConfig.java
│       └── exception/
│           ├── GlobalExceptionHandler.java
│           ├── NoteNotFoundException.java
│           └── UnauthorizedException.java
│
├── settings-service/             # User preferences + account management (port 8083)
│   ├── Dockerfile                # Multi-stage: golang:1.23-alpine → alpine:3.19 (~15 MB)
│   ├── go.mod                    # Gin 1.10.0, sqlx 1.3.5, lib/pq 1.10.9
│   │                             # golang-migrate 4.17.1, x/crypto 0.24.0
│   ├── go.sum
│   ├── cmd/server/
│   │   └── main.go               # Wire dependencies, run migrations, start Gin server
│   ├── internal/
│   │   ├── config/               # Env-var config loader (DATABASE_URL, PORT)
│   │   ├── database/             # sqlx Connect + golang-migrate runner
│   │   ├── handler/
│   │   │   ├── settings_handler.go  # GET/PUT/PATCH/DELETE /settings
│   │   │   ├── account_handler.go   # PUT /settings/account/password
│   │   │   └── danger_handler.go    # DELETE /settings/account (atomic tx)
│   │   ├── middleware/
│   │   │   └── user_context.go   # Reads X-User-Id, returns 401 if missing
│   │   ├── model/
│   │   │   └── settings.go       # Preferences (JSONB, driver.Valuer/sql.Scanner)
│   │   │                         # UserSettings, DefaultPreferences(), APIError
│   │   ├── repository/           # sqlx-based settings CRUD (upsert, patch, delete)
│   │   └── service/
│   │       ├── settings_service.go  # Get / Put / Patch / Reset logic
│   │       └── account_service.go   # ChangePassword + DeleteAccount (atomic tx)
│   └── migrations/
│       ├── 000001_create_user_settings.up.sql
│       ├── 000001_create_user_settings.down.sql
│       └── embed.go              # Go embed.FS — migrations bundled in binary
│
├── ml-service/                   # Semantic ML engine (port 8001)
│   ├── Dockerfile
│   ├── requirements.txt          # Full install: torch 2.6.0 (GPU support)
│   ├── requirements-cpu.txt      # CPU-only install for development
│   ├── app/
│   │   ├── main.py               # FastAPI app, lifespan startup/shutdown, /health
│   │   ├── config.py             # Pydantic Settings (env vars)
│   │   ├── database.py           # asyncpg connection pool (init/close)
│   │   ├── schemas.py            # Pydantic request/response schemas
│   │   ├── models/
│   │   │   ├── embedder.py       # BiEncoder (BAAI/bge-large-en-v1.5, 1024-dim)
│   │   │   └── reranker.py       # CrossEncoder (ms-marco-MiniLM-L-6-v2)
│   │   └── routers/
│   │       ├── embed.py          # POST /embed — generate & upsert embeddings
│   │       └── search.py         # POST /search — two-stage retrieval
│   └── tests/
│       ├── conftest.py
│       ├── test_embed.py
│       └── test_search.py
│
└── frontend/                     # React 18 SPA (port 5173)
    ├── Dockerfile                 # Multi-stage: node:20-alpine build → nginx:1.27-alpine serve
    ├── vercel.json                # Vercel deployment config (Vite framework)
    ├── package.json               # React 18.3.1, Zustand 4.5.2, Axios 1.6.8
    │                              # react-router-dom 6.23.1, Vite 5.3.1
    ├── vite.config.js
    ├── tailwind.config.js         # TailwindCSS 3.4.4 design tokens + custom utilities
    ├── postcss.config.js
    └── src/
        ├── App.jsx                # Router: /login, /register, /dashboard (+ wildcard redirect)
        ├── main.jsx
        ├── index.css              # Design system tokens (CSS custom properties)
        ├── api/
        │   └── client.js          # Axios instance (VITE_API_URL base, auth interceptor)
        ├── store/
        │   ├── authStore.js       # Zustand — user session, JWT in localStorage, logout
        │   ├── notesStore.js      # Zustand — note list, CRUD, search results, tag filter
        │   └── settingsStore.js   # Zustand — preferences GET/PUT/PATCH/DELETE,
        │                          #            changePassword, deleteAccount
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── DashboardPage.jsx  # Workspace: notes grid, search bar, tag cloud,
        │                          #            knowledge map SVG, FAB, modals
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx
        │   │   ├── Sidebar.jsx
        │   │   └── ProtectedRoute.jsx
        │   ├── notes/
        │   │   ├── NoteCard.jsx
        │   │   ├── NoteDetail.jsx
        │   │   ├── NoteEditor.jsx
        │   │   └── NoteList.jsx
        │   ├── search/
        │   │   └── SearchBar.jsx
        │   └── ui/
        │       ├── Button.jsx
        │       ├── Input.jsx
        │       ├── TextArea.jsx
        │       ├── Modal.jsx
        │       ├── TagBadge.jsx
        │       ├── Toast.jsx      # Global ToastProvider + useToast hook
        │       └── CortexLogo.jsx
        └── utils/
            └── helpers.js
```

---

## Services

### API Gateway (port 8080)

The single entry point for all client traffic. Built on **Spring Cloud Gateway** (reactive/WebFlux). All downstream services are internal to the Docker network.

| Responsibility | Detail |
|---|---|
| **JWT Validation** | `JwtAuthFilter` — validates `Authorization: Bearer <token>` on every protected route and injects `X-User-Id` downstream |
| **Rate Limiting** | `RateLimitFilter` — Bucket4j `8.10.1` token-bucket algorithm, state stored in Redis via Lettuce reactive client |
| **Routing** | `/auth/**` → auth-service · `/notes/**` + `/search/**` → notes-service · `/settings/**` → settings-service |
| **CORS** | Configured globally in `CorsConfig` |

**Key dependencies**: Spring Cloud Gateway `2023.0.1`, Spring Security, jjwt `0.12.5`, Bucket4j `8.10.1` (core + redis), Spring Data Redis Reactive (Lettuce)

**Test infrastructure**: WireMock (stubs for auth-service and notes-service), embedded-redis `1.4.3` (no external Redis in CI), reactor-test

---

### Auth Service (port 8081)

Handles user registration, login, and JWT issuance.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/auth/register` | POST | Public | Create new account (email + password) |
| `/auth/login` | POST | Public | Authenticate and receive a JWT |
| `/actuator/health` | GET | Public | Spring Boot Actuator health check |

**Key details**:
- Passwords hashed with **BCrypt** via Spring Security
- JWT signed with **HS256** using `jjwt 0.12.5` (configurable expiry, default 24 h via `JWT_EXPIRATION_MINUTES=1440`)
- Schema managed by **Flyway 10.10.0** migrations
- API docs: `http://localhost:8081/swagger-ui.html` (SpringDoc OpenAPI `2.3.0`)
- **Test infrastructure**: Testcontainers `1.19.8` (real PostgreSQL container), Spring Security Test

---

### Notes Service (port 8082)

Core business service — CRUD for notes and semantic search delegation.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `GET /notes` | GET | JWT | List all notes for the authenticated user (paginated) |
| `POST /notes` | POST | JWT | Create a note — triggers embedding in ml-service |
| `GET /notes/{id}` | GET | JWT | Get a single note |
| `PUT /notes/{id}` | PUT | JWT | Update a note — re-embeds content |
| `DELETE /notes/{id}` | DELETE | JWT | Delete a note and its embedding |
| `POST /search` | POST | JWT | Two-stage semantic search over the user's knowledge base |

**Key details**:
- Reads `X-User-Id` header injected by the gateway (no direct JWT parsing)
- Notes cached in **Redis** via `@Cacheable` (Spring Cache, 10-minute TTL, Lettuce pool: max-active 8, max-idle 4)
- Communicates with ml-service via **Spring RestClient** (`MLServiceClient`)
- **Resilience4j** wraps all ml-service calls with two independent circuit breakers:
  - `ml-embed` — sliding window 10, 50% failure threshold, 10s slow-call, 10s timeout, 2 retries @ 500 ms
  - `ml-search` — sliding window 10, 50% failure threshold, 12s slow-call, 15s timeout, 2 retries @ 500 ms
- `pgvector` Java client (`com.pgvector:pgvector:0.1.4`) for vector column writes
- **Lombok** for boilerplate reduction (excluded from final JAR)
- **Flyway 10.10.0** schema management (separate `flyway_notes_history` table)
- Hikari pool: max 10 connections, min-idle 2, connection-timeout 30 s
- Actuator exposes: `health`, `info`, `metrics`, `circuitbreakers`, `caches`
- **Test infrastructure**: Testcontainers `1.19.8` (PostgreSQL), Spring Boot Testcontainers

---

### Settings Service (port 8083)

Go microservice — user preferences, account management, and danger zone.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `GET /settings` | GET | JWT | Fetch preferences (returns factory defaults if no record exists) |
| `PUT /settings` | PUT | JWT | Full replace of all preference fields |
| `PATCH /settings` | PATCH | JWT | Partial update — only the supplied fields change |
| `DELETE /settings` | DELETE | JWT | Reset preferences to factory defaults |
| `PUT /settings/account/password` | PUT | JWT | Change password (verifies current password via bcrypt) |
| `DELETE /settings/account` | DELETE | JWT | **Danger zone** — delete account + all data (atomic transaction, requires password) |
| `GET /health` | GET | Public | `{"status":"ok","service":"settings-service"}` |

**Key details**:
- Written in **Go 1.23** with **Gin 1.10.0**
- `middleware.UserContext()` reads `X-User-Id` from the gateway header; returns `401` if missing
- Preferences stored as **JSONB** in `user_settings` table — `Preferences` struct implements `driver.Valuer` / `sql.Scanner` for seamless sqlx serialisation
- **Default preferences**: `theme: dark`, `accentColor: #7C3AED`, `fontSize: md`, `emailDigest: false`, `weeklySummary: false`
- `PATCH` accepts `map[string]interface{}` for true partial updates without overwriting unset fields
- Password hashing with **bcrypt (cost 10)** via `golang.org/x/crypto v0.24.0` — byte-compatible with Spring Security's `BCryptPasswordEncoder`
- Account deletion is a **single atomic DB transaction**: deletes `user_settings` → `notes` → `users`
- DB migrations managed by **golang-migrate v4.17.1** and bundled in the binary via Go's `embed.FS` (no external SQL files at runtime)
- DB access via **sqlx v1.3.5** + **lib/pq v1.10.9** (pure-Go PostgreSQL driver)
- Multi-stage Docker build: `golang:1.23-alpine` build → `alpine:3.19` final image (~15 MB vs 250 MB+ for JVM services)

**Preferences schema**:
```json
{
  "theme":         "dark | light | system",
  "accentColor":   "#7C3AED",
  "fontSize":      "sm | md | lg",
  "emailDigest":   false,
  "weeklySummary": false
}
```

---

### ML Service (port 8001)

Python FastAPI service — the semantic intelligence layer.

| Endpoint | Method | Description |
|---|---|---|
| `POST /embed` | POST | Embed a note's content and upsert the `embedding` column in PostgreSQL |
| `POST /search` | POST | Two-stage semantic search (see [ML Pipeline](#ml-pipeline)) |
| `GET /health` | GET | Returns `status`, `bi_encoder_loaded`, `reranker_loaded`, `device` |
| `GET /docs` | GET | Interactive Swagger UI |
| `GET /redoc` | GET | ReDoc API documentation |

**Models loaded at startup** (downloaded on first run, cached in `model_cache/`):

| Model | Size | Purpose |
|---|---|---|
| `BAAI/bge-large-en-v1.5` | ~1.2 GB | Bi-encoder · 1024-dim L2-normalized embeddings |
| `cross-encoder/ms-marco-MiniLM-L-6-v2` | ~120 MB | Cross-encoder reranker |

> ⚠️ **First startup** downloads ~1.35 GB of model weights. The `start_period: 120s` in Docker Compose accounts for this.

**Key dependencies**: FastAPI `0.115.0`, Uvicorn `0.30.6` (with standard extras), sentence-transformers `3.3.1`, PyTorch `2.6.0`, asyncpg `0.30.0`, pgvector `0.3.5`, Pydantic `2.10.6` + pydantic-settings `2.7.1`, httpx `0.27.2`, python-dotenv `1.0.1`, ruff `0.8.6` (linter)

**Test infrastructure**: pytest `8.3.4`, pytest-asyncio `0.24.0`, anyio `4.7.0`

---

### Frontend (port 5173)

React 18 SPA built with Vite and TailwindCSS. In Docker it is built by `node:20-alpine` and served by **Nginx 1.27-alpine** with SPA fallback routing, aggressive static asset caching (30 days), and security headers. Also deployable directly to **Vercel** (`vercel.json` included).

| Page / Route | Description |
|---|---|
| `/login` | Authentication page with Cortex branding and feature highlights |
| `/register` | Account creation page |
| `/dashboard` | Main workspace — note grid, note editor/viewer modals, semantic search bar, tag cloud filter, animated knowledge map SVG, floating action button |

**Key details**:
- `ProtectedRoute` — redirects unauthenticated users to `/login`; unknown routes redirect to `/dashboard`
- **Three Zustand `4.5.2` stores**:
  - `authStore` — user session, JWT persisted to `localStorage`, auto-attached as `Authorization` header
  - `notesStore` — note list, CRUD operations, semantic search results, active tag filter, pagination
  - `settingsStore` — preferences fetch/save (GET/PUT/PATCH), reset (DELETE), change password, delete account
- Axios `1.6.8` `client.js` — configures `VITE_API_URL` base URL and auth interceptor
- Dark-mode-first design system defined in `index.css` as CSS custom properties
- Nginx adds `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` security headers

---

## ML Pipeline

```
User Query
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  STAGE 1 — Bi-Encoder Retrieval  (fast, ~ms)        │
│                                                     │
│  1. Embed query with BAAI/bge-large-en-v1.5         │
│     (prepends "Represent this sentence for          │
│      searching relevant passages: " prefix)         │
│  2. Cosine similarity search via pgvector            │
│     ivfflat index  (embedding <=> $1::vector)       │
│  3. Return top-20 candidate notes for user_id       │
└──────────────────────┬──────────────────────────────┘
                       │ 20 candidates
                       ▼
┌─────────────────────────────────────────────────────┐
│  STAGE 2 — Cross-Encoder Reranking  (precise, ~ms)  │
│                                                     │
│  1. Form (query, note_content) pairs for all 20     │
│  2. Score with cross-encoder/ms-marco-MiniLM-L-6-v2 │
│     (sees full query + document context together)   │
│  3. Sort by rerank_score descending                 │
│  4. Return top_k results                            │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
              SearchResponse {
                results: [{ note_id, similarity_score,
                            rerank_score }],
                query_time_ms,
                retrieval_count
              }
```

---

## Tech Stack

### Backend

| Layer | Technology | Version |
|---|---|---|
| **API Gateway** | Spring Cloud Gateway (WebFlux / Reactive) | `2023.0.1` |
| **Rate Limiting** | Bucket4j + Redis (Lettuce reactive) | `8.10.1` |
| **Auth Service** | Spring Boot MVC + Spring Data JPA | `3.2.4` / Java 21 |
| **Notes Service** | Spring Boot MVC + Spring Data JPA + JDBC | `3.2.4` / Java 21 |
| **DB Migrations (JVM)** | Flyway (core + postgresql dialect) | `10.10.0` |
| **JWT** | jjwt (HS256, api + impl + jackson) | `0.12.5` |
| **Circuit Breaker** | Resilience4j (Spring Cloud starter) | via Spring Cloud `2023.0.1` |
| **AOP** | Spring Boot AOP (for @CircuitBreaker annotation) | `3.2.4` |
| **Boilerplate** | Lombok | compile-only |
| **API Docs** | SpringDoc OpenAPI (Swagger UI, WebMVC) | `2.3.0` |
| **pgvector (Java)** | com.pgvector:pgvector | `0.1.4` |
| **Settings Service** | Go + Gin | `1.23` / `1.10.0` |
| **DB Driver (Go)** | lib/pq (pure-Go PostgreSQL) | `1.10.9` |
| **SQL Toolkit (Go)** | sqlx | `1.3.5` |
| **DB Migrations (Go)** | golang-migrate | `4.17.1` |
| **Password Hashing (Go)** | golang.org/x/crypto (bcrypt) | `0.24.0` |
| **ML Service** | FastAPI + Uvicorn (standard) | `0.115.0` / `0.30.6` |
| **ML Runtime** | PyTorch | `2.6.0` |
| **Embeddings / Reranking** | sentence-transformers | `3.3.1` |
| **Async DB (Python)** | asyncpg | `0.30.0` |
| **pgvector (Python)** | pgvector | `0.3.5` |
| **Data Validation (Python)** | Pydantic v2 + pydantic-settings | `2.10.6` / `2.7.1` |
| **HTTP Client (Python)** | httpx | `0.27.2` |
| **Python Linter** | ruff | `0.8.6` |

### Data Layer

| Technology | Version / Image | Role |
|---|---|---|
| **PostgreSQL + pgvector** | `pgvector/pgvector:pg16` | Relational data + 1024-dim vector embeddings |
| **Redis** | `redis:7-alpine` | Rate-limiting state (gateway) + notes cache (notes-service) |

### Frontend

| Technology | Version | Role |
|---|---|---|
| **React** | `18.3.1` | UI framework |
| **Vite** | `5.3.1` | Build tool & dev server |
| **React Router DOM** | `6.23.1` | Client-side routing |
| **Zustand** | `4.5.2` | State management (authStore, notesStore, settingsStore) |
| **Axios** | `1.6.8` | HTTP client with auth interceptor |
| **TailwindCSS** | `3.4.4` | Utility-first CSS framework |
| **PostCSS** | `8.4.38` | CSS transformation pipeline |
| **Autoprefixer** | `10.4.19` | Vendor prefix automation |
| **ESLint** | `8.57.0` | JS/JSX linting |

### Infrastructure & Tooling

| Technology | Version / Image | Role |
|---|---|---|
| **Docker + Docker Compose** | v2 plugin | Container orchestration |
| **Node.js** | `20-alpine` | Frontend build stage |
| **Nginx** | `1.27-alpine` | Frontend static file serving (Docker / prod) |
| **Vercel** | — | Optional frontend cloud deployment |

### Testing

| Technology | Service | Role |
|---|---|---|
| **Testcontainers** `1.19.8` | auth-service, notes-service | Real PostgreSQL container for integration tests |
| **WireMock** (Spring Cloud Contract) | api-gateway | Stub upstream services in gateway tests |
| **embedded-redis** `1.4.3` | api-gateway | In-process Redis for CI (no external Redis needed) |
| **reactor-test** | api-gateway | Project Reactor test utilities |
| **Spring Security Test** | auth-service | Security-aware test support |
| **pytest** `8.3.4` + **pytest-asyncio** `0.24.0` | ml-service | Async test runner |
| **anyio** `4.7.0` | ml-service | Async utilities for tests |

---

## Getting Started

### Prerequisites

| Tool | Minimum version |
|---|---|
| Docker Desktop | 24+ |
| Docker Compose | v2 (plugin) |
| Node.js (frontend dev only) | 18+ |
| Java 21 (JVM service dev only) | 21 |
| Go (settings-service dev only) | 1.23 |
| Python (ML service dev only) | 3.11 |

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/shanmukhraj7/Cortex.git
cd Cortex

# Copy and edit the environment file
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
POSTGRES_PASSWORD=your_secure_password
REDIS_PASSWORD=your_redis_password
JWT_SECRET=your_32+_char_secret_key
```

All other variables have sensible defaults — see [Environment Variables](#environment-variables).

---

### Run with Docker Compose (Recommended)

```bash
# Build and start all services
docker compose up --build

# Or run in detached mode
docker compose up --build -d

# Watch logs for a specific service
docker compose logs -f ml-service

# Stop everything
docker compose down
```

**Startup order** (enforced by `depends_on` + healthchecks):

```
postgres + redis  →  auth-service + ml-service + settings-service  →  notes-service  →  api-gateway  →  frontend
```

> ⚠️ `ml-service` has a `start_period: 120s` — it downloads ~1.35 GB of model weights on first run.

**Exposed ports after `docker compose up`**:

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| Auth Service | http://localhost:8081 |
| Auth Swagger UI | http://localhost:8081/swagger-ui.html |
| Notes Service | http://localhost:8082 |
| Settings Service | http://localhost:8083 |
| ML Service | http://localhost:8001 |
| ML Service Swagger | http://localhost:8001/docs |
| ML Service ReDoc | http://localhost:8001/redoc |

---

### Run Locally (Dev Mode)

#### Frontend only

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Set `VITE_API_URL` in `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:8080
```

#### Auth Service

```bash
cd auth-service
./mvnw spring-boot:run \
  -Dspring-boot.run.jvmArguments="-DDATABASE_URL=jdbc:postgresql://localhost:5432/cortex \
  -DDATABASE_USERNAME=postgres \
  -DDATABASE_PASSWORD=yourpassword \
  -DJWT_SECRET=your-secret-key"
```

#### Notes Service

```bash
cd notes-service
./mvnw spring-boot:run \
  -Dspring-boot.run.jvmArguments="-DDATABASE_URL=jdbc:postgresql://localhost:5432/cortex \
  -DDATABASE_USERNAME=postgres \
  -DDATABASE_PASSWORD=yourpassword \
  -DML_SERVICE_URL=http://localhost:8001 \
  -DREDIS_HOST=localhost \
  -DREDIS_PORT=6379"
```

#### Settings Service

```bash
cd settings-service
DATABASE_URL="postgres://postgres:yourpassword@localhost:5432/cortex?sslmode=disable" \
PORT=8083 \
go run ./cmd/server
```

#### ML Service

```bash
cd ml-service

# CPU-only install (recommended for development)
pip install -r requirements-cpu.txt

# Or full install with GPU support
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env

# Start the service
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
# → http://localhost:8001/docs
```

#### API Gateway

```bash
cd api-gateway
./mvnw spring-boot:run \
  -Dspring-boot.run.jvmArguments="-DJWT_SECRET=your-secret-key \
  -DAUTH_SERVICE_URL=http://localhost:8081 \
  -DNOTES_SERVICE_URL=http://localhost:8082 \
  -DSETTINGS_SERVICE_URL=http://localhost:8083 \
  -DREDIS_URL=redis://localhost:6379"
```

---

## API Reference

All requests to protected endpoints must include:
```
Authorization: Bearer <jwt_token>
```

### Auth

```http
POST /auth/register
Content-Type: application/json

{ "email": "user@example.com", "password": "securepassword" }
```

```http
POST /auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "securepassword" }

→ { "token": "eyJ...", "userId": "uuid", "email": "..." }
```

### Notes

```http
# List notes (paginated)
GET /notes?page=0&size=20

# Create a note
POST /notes
{ "title": "My Note", "content": "Note content...", "tags": ["ai", "research"] }

# Get a single note
GET /notes/{id}

# Update a note
PUT /notes/{id}
{ "title": "Updated", "content": "Updated content...", "tags": ["updated"] }

# Delete a note
DELETE /notes/{id}
```

### Search

```http
POST /search
{ "query": "machine learning embeddings", "top_k": 5 }

→ {
    "results": [
      { "noteId": "uuid", "title": "...", "rerank_score": 0.92, "similarity_score": 0.87 }
    ],
    "query_time_ms": 142.3,
    "retrieval_count": 20
  }
```

### Settings

```http
# Get preferences (returns defaults if not yet saved)
GET /settings

# Full replace
PUT /settings
{ "theme": "light", "accentColor": "#0EA5E9", "fontSize": "lg", "emailDigest": true, "weeklySummary": false }

# Partial update (only listed fields change)
PATCH /settings
{ "theme": "dark", "fontSize": "sm" }

# Reset to factory defaults
DELETE /settings

# Change password
PUT /settings/account/password
{ "currentPassword": "old-password", "newPassword": "new-secure-password" }

# ⚠️ Delete account (irreversible — requires password confirmation)
DELETE /settings/account
{ "password": "current-password" }
→ 204 No Content  (clear JWT from client storage after this)
```

---

## Environment Variables

| Variable | Service | Default | Description |
|---|---|---|---|
| `POSTGRES_DB` | postgres | `cortex` | Database name |
| `POSTGRES_USER` | postgres | `postgres` | Database user |
| `POSTGRES_PASSWORD` | postgres | — | **Required** — DB password |
| `REDIS_PASSWORD` | redis, notes-service, gateway | — | **Required in prod** — Redis auth password |
| `JWT_SECRET` | auth, gateway | — | **Required** — HS256 signing key (min 32 chars) |
| `JWT_EXPIRATION_MINUTES` | auth | `1440` | Token lifetime in minutes (default 24 h) |
| `DEVICE` | ml-service | `cpu` | Inference device: `cpu`, `cuda`, `mps` |
| `BI_ENCODER_MODEL` | ml-service | `BAAI/bge-large-en-v1.5` | HuggingFace bi-encoder model ID |
| `CROSS_ENCODER_MODEL` | ml-service | `cross-encoder/ms-marco-MiniLM-L-6-v2` | HuggingFace cross-encoder model ID |
| `MODEL_CACHE_DIR` | ml-service | `/app/model_cache` | Local model weights cache path |
| `TOP_K_RETRIEVAL` | ml-service | `20` | Bi-encoder candidate pool size before reranking |
| `VITE_API_URL` | frontend | `http://localhost:8080` | API Gateway base URL (baked at Vite build time) |
| `REDIS_URL` | api-gateway | `redis://localhost:6379` | Redis connection URI (Bucket4j + reactive Lettuce) |
| `REDIS_HOST` | notes-service | `localhost` | Redis hostname |
| `REDIS_PORT` | notes-service | `6379` | Redis port |
| `REDIS_PASSWORD` | notes-service | _(empty)_ | Redis password (empty = no auth; set in prod) |
| `ML_SERVICE_URL` | notes-service | `http://localhost:8001` | Internal ML service base URL |
| `AUTH_SERVICE_URL` | api-gateway | `http://auth-service:8081` | Auth service route target |
| `NOTES_SERVICE_URL` | api-gateway | `http://notes-service:8082` | Notes service route target |
| `SETTINGS_SERVICE_URL` | api-gateway | `http://settings-service:8083` | Settings service route target |
| `DATABASE_URL` | settings-service | — | PostgreSQL DSN: `postgres://user:pass@host/db?sslmode=disable` |
| `PORT` | settings-service | `8083` | HTTP listen port |

---

## License

Shanmukha Raj
