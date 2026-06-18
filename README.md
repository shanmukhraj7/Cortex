# Cortex — AI-Powered Personal Knowledge Base

> Write, organise, and retrieve notes using natural language — powered by a two-stage semantic ML pipeline.

[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.4-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Go](https://img.shields.io/badge/Go-1.23-00ADD8?logo=go)](https://go.dev/)
[![Gin](https://img.shields.io/badge/Gin-1.10-00ADD8?logo=go)](https://gin-gonic.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docs.docker.com/compose/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20+%20pgvector-4169E1?logo=postgresql)](https://github.com/pgvector/pgvector)

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
  - [Run with Docker](#run-with-docker-compose-recommended)
  - [Run Locally (Dev)](#run-locally-dev-mode)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)

---

## Overview

Cortex is a full-stack, microservices-based knowledge base application. Users can create and manage notes which are automatically embedded into a vector database using a local bi-encoder model (`BAAI/bge-large-en-v1.5`). Semantic search is powered by a **two-stage retrieval pipeline**:

1. **Stage 1 — Bi-Encoder + pgvector**: Fast approximate nearest-neighbour retrieval using 1024-dimensional embeddings stored in PostgreSQL with the `pgvector` extension.
2. **Stage 2 — Cross-Encoder Reranking**: Precise relevance scoring of the top-20 candidates using `cross-encoder/ms-marco-MiniLM-L-6-v2`, returning only the most relevant results.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / Client                      │
│              React 18 + Vite  (port 5173)                   │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP / REST
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway  (port 8080)                  │
│          Spring Cloud Gateway  ·  WebFlux (Reactive)        │
│                                                             │
│  ┌──────────────────┐   ┌─────────────────────────────┐    │
│  │  JwtAuthFilter   │   │      RateLimitFilter         │    │
│  │ (validates JWT,  │   │  (Bucket4j token-bucket      │    │
│  │  injects userId  │   │   backed by Redis)           │    │
│  │  header)         │   └─────────────────────────────┘    │
│  └──────────────────┘                                       │
│                                                             │
│  Routes:  /auth/**     →  auth-service                        │
│           /notes/**    →  notes-service                        │
│           /search/**   →  notes-service                        │
│           /settings/** →  settings-service                     │
└──────────┬──────────────────────┬───────────────────────────┘
           │                      │
           ▼                      ▼
┌─────────────────┐    ┌──────────────────────────────────────┐
│  Auth Service   │    │         Notes Service  (port 8082)   │
│  (port 8081)    │    │         Spring Boot · MVC            │
│  Spring Boot    │    │                                      │
│                 │    │  ┌──────────────┐ ┌───────────────┐  │
│  - Register     │    │  │NoteController│ │SearchController│  │
│  - Login        │    │  └──────────────┘ └───────────────┘  │
│  - JWT issue    │    │         │                 │           │
│                 │    │         ▼                 ▼           │
│  PostgreSQL     │    │  ┌──────────────┐ ┌───────────────┐  │
│  + Flyway       │    │  │  NoteService │ │ SearchService │  │
│  + jjwt 0.12   │    │  └──────────────┘ └───────────────┘  │
└─────────────────┘    │         │                 │           │
                       │    Redis Cache       MLServiceClient   │
                       │    (Spring Cache)         │           │
                       └──────────────────────┬───┘           │
                                              │               │
                                              ▼               │
                              ┌───────────────────────────┐   │
                              │   ML Service  (port 8001)  │   │
                              │   FastAPI + Python         │   │
                              │                            │   │
                              │  POST /embed               │   │
                              │  POST /search              │   │
                              │  GET  /health              │   │
                              │                            │   │
                              │  ┌─────────────────────┐  │   │
                              │  │ BiEncoder            │  │   │
                              │  │ BAAI/bge-large-en    │  │   │
                              │  │ 1024-dim · L2-norm   │  │   │
                              │  └─────────────────────┘  │   │
                              │  ┌─────────────────────┐  │   │
                              │  │ CrossEncoder Reranker│  │   │
                              │  │ ms-marco-MiniLM-L-6  │  │   │
                              │  └─────────────────────┘  │   │
                              └───────────────────────────┘   │
                                              │               │
                              ┌───────────────▼───────────┐   │
                              │  PostgreSQL 16 + pgvector  │   │
                              │  - users table             │◄──┘
                              │  - notes table             │
                              │  - embedding column        │
                              │    (vector 1024)           │
                              │  Flyway migrations         │
                              └───────────────────────────┘

                              ┌───────────────────────────┐
                              │  Redis 7                  │
                              │  - Rate limiting (Bucket4j│
                              │    via API Gateway)       │
                              │  - Notes cache            │
                              │    (Spring Cache /        │
                              │     notes-service)        │
                              └───────────────────────────┘
```

---

## Project Structure

```
Cortex/
├── docker-compose.yml          # Full-stack local dev orchestration
├── docker-compose.prod.yml     # Production deployment config
├── .env.example                # Environment variable template
│
├── api-gateway/                # Spring Cloud Gateway (port 8080)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/cortex/gateway/
│       ├── GatewayApplication.java
│       ├── JwtAuthFilter.java          # JWT validation + userId header injection
│       ├── RateLimitFilter.java        # Bucket4j token-bucket rate limiter
│       └── config/
│           ├── CorsConfig.java
│           ├── GatewayConfig.java      # Route definitions
│           ├── RedisConfig.java
│           └── SecurityConfig.java
│
├── auth-service/               # Authentication microservice (port 8081)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/cortex/auth/
│       ├── AuthApplication.java
│       ├── controller/
│       │   └── AuthController.java     # POST /auth/register, POST /auth/login
│       ├── entity/
│       │   └── User.java
│       ├── repository/
│       │   └── UserRepository.java
│       ├── security/
│       │   ├── JwtService.java         # jjwt 0.12.5 — sign & validate tokens
│       │   └── SecurityConfig.java
│       ├── service/
│       │   └── AuthService.java
│       └── exception/
│           └── GlobalExceptionHandler.java
│
├── notes-service/              # Notes CRUD + search proxy (port 8082)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/cortex/notes/
│       ├── NotesApplication.java
│       ├── controller/
│       │   ├── NoteController.java     # CRUD: /notes/**
│       │   └── SearchController.java   # Semantic search: /search
│       ├── service/
│       │   ├── NoteService.java        # Business logic + Redis caching
│       │   └── SearchService.java      # Delegates to MLServiceClient
│       ├── client/
│       │   └── MLServiceClient.java    # RestClient → ml-service
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
│       │   ├── RedisConfig.java
│       │   ├── ResilienceConfig.java   # Resilience4j circuit breaker
│       │   └── SecurityConfig.java
│       └── exception/
│           ├── GlobalExceptionHandler.java
│           ├── NoteNotFoundException.java
│           └── UnauthorizedException.java
│
├── ml-service/                 # Semantic ML engine (port 8001)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── requirements-cpu.txt
│   └── app/
│       ├── main.py             # FastAPI app, lifespan startup/shutdown
│       ├── config.py           # Pydantic settings
│       ├── database.py         # asyncpg connection pool
│       ├── schemas.py          # Pydantic request/response schemas
│       ├── models/
│       │   ├── embedder.py     # BiEncoder (BAAI/bge-large-en-v1.5, 1024-dim)
│       │   └── reranker.py     # CrossEncoder (ms-marco-MiniLM-L-6-v2)
│       └── routers/
│           ├── embed.py        # POST /embed — generate & store embeddings
│           └── search.py       # POST /search — two-stage retrieval
│
└── frontend/                   # React SPA (port 5173)
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx             # Router: /login, /register, /dashboard
        ├── main.jsx
        ├── index.css           # Design system tokens
        ├── api/
        │   └── client.js       # Axios instance (base URL, auth interceptor)
        ├── store/
        │   ├── authStore.js    # Zustand — user session, JWT persistence
        │   └── notesStore.js   # Zustand — notes list, CRUD, search
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── DashboardPage.jsx
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
        │       ├── Toast.jsx
        │       └── CortexLogo.jsx
        └── utils/
            └── helpers.js
```

---

## Services

### API Gateway (port 8080)

The single entry point for all client traffic. Built on **Spring Cloud Gateway** (reactive/WebFlux).

| Responsibility | Detail |
|---|---|
| **JWT Validation** | `JwtAuthFilter` — validates the `Authorization: Bearer <token>` header on every protected route and injects `X-User-Id` downstream |
| **Rate Limiting** | `RateLimitFilter` — Bucket4j token-bucket algorithm, state stored in Redis |
| **Routing** | `/auth/**` → auth-service · `/notes/**` and `/search/**` → notes-service |
| **CORS** | Configured globally in `CorsConfig` |

**Dependencies**: Spring Cloud Gateway, Spring Security, jjwt 0.12.5, Bucket4j 8.10.1, Redis (Lettuce reactive)

---

### Auth Service (port 8081)

Handles user registration, login, and JWT issuance.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/auth/register` | POST | Public | Create new account (email + password) |
| `/auth/login` | POST | Public | Authenticate and receive a JWT |
| `/actuator/health` | GET | Public | Health check |

**Key details**:
- Passwords hashed with **BCrypt** via Spring Security
- JWT signed with **HS256** using `jjwt 0.12.5` (configurable expiry, default 24 h)
- Schema managed by **Flyway** migrations
- API docs: `http://localhost:8081/swagger-ui.html` (SpringDoc OpenAPI 2.3.0)

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
| `POST /search` | POST | JWT | Semantic search over the user's knowledge graph |

**Key details**:
- Reads `X-User-Id` header injected by the gateway (no direct JWT parsing)
- Notes list and individual notes cached in **Redis** via `@Cacheable` (Spring Cache)
- Communicates with ml-service via **Spring RestClient** (`MLServiceClient`)
- **Resilience4j circuit breaker** wraps all ml-service calls — falls back gracefully if ml-service is down
- `pgvector` Java client (`com.pgvector:pgvector:0.1.4`) for vector column writes

---

### Settings Service (port 8083)

Go microservice — user preferences, account management, and danger zone.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/settings` | GET | JWT | Fetch current preferences (returns defaults if not yet saved) |
| `/settings` | PUT | JWT | Full replace of all preference fields |
| `/settings` | PATCH | JWT | Partial update — only supplied fields change |
| `/settings` | DELETE | JWT | Reset preferences to factory defaults |
| `/settings/account/password` | PUT | JWT | Change password (verifies current password via bcrypt) |
| `/settings/account` | DELETE | JWT | **Danger zone** — delete account (requires password confirmation; cascades notes + settings + user) |
| `/health` | GET | Public | `{"status":"ok"}` |

**Key details**:
- Written in **Go 1.23** with the **Gin** framework
- Reads `X-User-Id` header injected by the gateway (same trust model as notes-service)
- Settings stored as **JSONB** in `user_settings` table — flexible, schema-free evolution
- Password hashed with **bcrypt (cost 10)** — compatible with Spring Security's BCryptPasswordEncoder
- Account deletion is a **single atomic DB transaction**: `user_settings` → `notes` → `users`
- Migrations embedded in the binary via Go's `embed.FS` — no external SQL files at runtime
- Multi-stage Docker build produces an **~15 MB Alpine image** (vs 250 MB+ for JVM services)

---

### ML Service (port 8001)

Python FastAPI service — the semantic intelligence layer.

| Endpoint | Method | Description |
|---|---|---|
| `POST /embed` | POST | Embed a note's content and upsert the `embedding` column in PostgreSQL |
| `POST /search` | POST | Two-stage semantic search (see [ML Pipeline](#ml-pipeline)) |
| `GET /health` | GET | Returns model load status and device info |
| `GET /docs` | GET | Interactive Swagger UI |

**Models loaded at startup** (downloaded on first run, cached in `model_cache/`):
| Model | Size | Purpose |
|---|---|---|
| `BAAI/bge-large-en-v1.5` | ~1.2 GB | Bi-encoder · 1024-dim L2-normalized embeddings |
| `cross-encoder/ms-marco-MiniLM-L-6-v2` | ~120 MB | Cross-encoder reranker |

> ⚠️ **First startup** downloads ~1.35 GB of model weights. The `start_period: 120s` in Docker Compose accounts for this.

---

### Frontend (port 5173)

React 18 SPA with Vite, TailwindCSS, and Zustand for state management.

| Page / Route | Description |
|---|---|
| `/login` | Authentication page with "Knowledge Cortex" hero, feature badges |
| `/register` | Account creation page |
| `/dashboard` | Main workspace — note list, editor, semantic search, sidebar navigation |

**Key details**:
- `ProtectedRoute` — redirects unauthenticated users to `/login`
- `authStore` (Zustand) — persists JWT to `localStorage`, attaches as `Authorization` header
- `notesStore` (Zustand) — manages note CRUD and search state
- Axios `client.js` — configures base URL (`VITE_API_URL`) and auth interceptor
- Dark-mode-first design system defined in `index.css`

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

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React + Vite | 18 / 5.x |
| **State Management** | Zustand | 4.5 |
| **Styling** | TailwindCSS | 3.4 |
| **HTTP Client** | Axios | 1.6 |
| **API Gateway** | Spring Cloud Gateway (WebFlux) | 2023.0.1 |
| **Rate Limiting** | Bucket4j + Redis | 8.10.1 |
| **Auth Service** | Spring Boot MVC | 3.2.4 / Java 21 |
| **Notes Service** | Spring Boot MVC | 3.2.4 / Java 21 |
| **Settings Service** | Go + Gin | 1.23 / 1.10.0 |
| **ML Service** | FastAPI + Uvicorn | 0.115 / Python 3.11+ |
| **Bi-Encoder** | sentence-transformers (BAAI/bge-large-en-v1.5) | 3.3.1 |
| **Cross-Encoder** | sentence-transformers (ms-marco-MiniLM-L-6-v2) | 3.3.1 |
| **Database** | PostgreSQL 16 + pgvector | — |
| **Cache** | Redis 7 | — |
| **DB Migrations** | Flyway | 10.10.0 |
| **JWT** | jjwt | 0.12.5 |
| **Circuit Breaker** | Resilience4j | — |
| **Containerisation** | Docker + Docker Compose | — |

---

## Getting Started

### Prerequisites

| Tool | Minimum version |
|---|---|
| Docker Desktop | 24+ |
| Docker Compose | v2 (plugin) |
| Node.js (frontend dev only) | 18+ |
| Java 21 (service dev only) | 21 |
| Python 3.11 (ML dev only) | 3.11 |

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
JWT_SECRET=your_32+_char_secret_key
```

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
postgres + redis  →  auth-service + ml-service  →  notes-service  →  api-gateway  →  frontend
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
| ML Service Docs | http://localhost:8001/docs |

---

### Run Locally (Dev Mode)

#### Frontend only

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Set `VITE_API_URL` in `frontend/.env.local` to point at your backend:
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
| `JWT_SECRET` | auth, gateway | — | **Required** — HS256 signing key (min 32 chars) |
| `JWT_EXPIRATION_MINUTES` | auth | `1440` | Token lifetime (minutes) |
| `DEVICE` | ml-service | `cpu` | Inference device: `cpu`, `cuda`, `mps` |
| `BI_ENCODER_MODEL` | ml-service | `BAAI/bge-large-en-v1.5` | HuggingFace model ID |
| `CROSS_ENCODER_MODEL` | ml-service | `cross-encoder/ms-marco-MiniLM-L-6-v2` | HuggingFace model ID |
| `MODEL_CACHE_DIR` | ml-service | `/app/model_cache` | Local model weights cache path |
| `TOP_K_RETRIEVAL` | ml-service | `20` | Bi-encoder candidate pool size |
| `VITE_API_URL` | frontend | `http://localhost:8080` | API Gateway base URL |
| `REDIS_URL` | api-gateway | — | Redis connection URI |
| `REDIS_HOST` | notes-service | — | Redis host |
| `REDIS_PORT` | notes-service | `6379` | Redis port |
| `ML_SERVICE_URL` | notes-service | — | Internal ML service URL |

---

## License

Shanmukha Raj
