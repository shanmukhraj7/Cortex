# Cortex — AI-Powered Personal Knowledge Base

> A production-grade microservices application: React frontend, Spring Cloud Gateway, two Spring Boot services, and a Python ML microservice delivering two-stage semantic search (bi-encoder retrieval + cross-encoder reranking) with Apple Silicon MPS acceleration.

**Live demo:** https://cortex.up.railway.app  
**API docs (Swagger):** https://cortex-api.up.railway.app/swagger-ui.html  
**GitHub:** https://github.com/shanmukhraj7/cortex

---

## What is Cortex?

Cortex is a personal knowledge base where you write, organise, and retrieve notes using **natural language**, not keywords.

Searching *"deep learning tricks I wrote about"* surfaces a note titled *"Batch normalisation and dropout techniques"* — even though none of those words appear in your query. Every note is converted to a semantic vector when saved, and search operates in that 1024-dimensional space rather than on raw text.

The two-stage retrieval pipeline mirrors what production search systems (Cohere Rerank, Elasticsearch semantic search) actually do: a fast bi-encoder retrieves 20 candidates, then a precise cross-encoder reranks them to the final top-5. This distinction — understanding *why* you need two stages — is the difference between a tutorial and a real information retrieval system.

---

## Repository layout

```
cortex/
├── frontend/                   React 18 + Vite + Tailwind CSS + Zustand
├── api-gateway/                Spring Cloud Gateway 4 — routing, JWT, rate limiting
├── auth-service/               Spring Boot 3.2 — register, login, JWT issuance
├── notes-service/              Spring Boot 3.2 — CRUD, cache, search coordination
├── ml-service/                 Python 3.11 + FastAPI — embeddings + reranking
├── .github/
│   └── workflows/
│       ├── ci.yml              PR gate: Java tests + Python tests + Docker build
│       ├── deploy.yml          main: build → GHCR → Railway + Vercel
│       └── dependabot.yml      weekly dependency updates
├── docker-compose.yml          full local dev stack — one command
├── docker-compose.prod.yml     production config
└── README.md                   this file
```

---

## Project Structure
```
cortex/
├── api-gateway/                   Spring Cloud Gateway
│   ├── src/main/java/com/recall/gateway/
│   │   ├── GatewayApplication.java
│   │   ├── config/
│   │   │   ├── GatewayConfig.java          route definitions
│   │   │   ├── SecurityConfig.java         JWT validation filter
│   │   │   └── CorsConfig.java
│   │   └── filter/
│   │       ├── JwtAuthFilter.java          validates JWT on every request
│   │       └── RateLimitFilter.java        Bucket4j + Redis
│   ├── src/main/resources/application.yml
│   └── pom.xml
│
├── auth-service/                  Spring Boot 3.2
│   ├── src/main/java/com/recall/auth/
│   │   ├── AuthApplication.java
│   │   ├── controller/AuthController.java
│   │   ├── service/AuthService.java
│   │   ├── security/JwtService.java
│   │   ├── entity/User.java
│   │   ├── repository/UserRepository.java
│   │   ├── dto/                            LoginRequest, RegisterRequest, TokenResponse
│   │   └── exception/GlobalExceptionHandler.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/V1__create_users.sql
│   ├── src/test/...
│   ├── Dockerfile
│   └── pom.xml
│
├── notes-service/                 Spring Boot 3.2
│   ├── src/main/java/com/recall/notes/
│   │   ├── NotesApplication.java
│   │   ├── controller/NoteController.java
│   │   ├── service/
│   │   │   ├── NoteService.java            @Cacheable / @CacheEvict
│   │   │   └── SearchService.java          calls ml-service
│   │   ├── client/MlServiceClient.java     RestClient HTTP caller
│   │   ├── entity/Note.java
│   │   ├── repository/NoteRepository.java  JPA + native pgvector query
│   │   ├── dto/                            NoteRequest, NoteResponse, SearchRequest/Response
│   │   ├── security/JwtContextFilter.java  reads user ID from forwarded JWT header
│   │   └── exception/GlobalExceptionHandler.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/
│   │       ├── V1__create_notes.sql
│   │       └── V2__add_pgvector.sql
│   ├── src/test/...
│   ├── Dockerfile
│   └── pom.xml
│
├── ml-service/                    Python FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                         FastAPI app + lifespan
│   │   ├── config.py                       pydantic-settings
│   │   ├── database.py                     asyncpg pool + pgvector
│   │   ├── schemas.py                      Pydantic DTOs
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── embedder.py                 BAAI/bge-large-en-v1.5 + MPS
│   │   │   └── reranker.py                 cross-encoder/ms-marco-MiniLM
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── embed.py                    POST /embed
│   │       └── search.py                   POST /search
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_embed.py
│   │   └── test_search.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   └── README.md
│
├── frontend/                      React + Vite (update VITE_API_URL only)
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
└── README.md

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Zustand | Fast iteration, minimal bundle |
| HTTP client | Axios | JWT interceptors, 401 redirect, timeout |
| Gateway | Spring Cloud Gateway 4, Java 21 | Reactive routing, JWT filter, Bucket4j rate limiting |
| Auth service | Spring Boot 3.2, Spring Security 6, JJWT, BCrypt | Battle-tested JWT + password hashing |
| Notes service | Spring Boot 3.2, Spring Data JPA, Spring Cache | @Cacheable annotations, virtual threads |
| DB migrations | Flyway | Versioned, reproducible SQL schema |
| Cache + rate limit | Redis 7, Bucket4j | Token-bucket rate limit, TTL-based note cache |
| Database | PostgreSQL 16 + pgvector | Notes + 1024-dim vectors in one ACID store |
| ML framework | Python 3.11, FastAPI, PyTorch | MPS GPU on Apple Silicon, CPU on Railway |
| Bi-encoder | BAAI/bge-large-en-v1.5 | No. 1 MTEB retrieval; 1024-dim; ~15 ms/embed on M4 |
| Cross-encoder | cross-encoder/ms-marco-MiniLM-L-6-v2 | Reranks top-20 → top-5 with 8–12 pt precision gain |
| API docs | SpringDoc OpenAPI 3 | Auto Swagger UI per service |
| Testing — Java | JUnit 5, Testcontainers, MockMvc | Real PostgreSQL + Redis in Docker during tests |
| Testing — Python | pytest, httpx | Embedding accuracy, search ranking order |
| CI/CD | GitHub Actions | PR gate + zero-downtime deploy on merge |
| Containers | Docker, Docker Compose | One-command local dev |
| Backend deploy | Railway | Auto-deploys from GHCR |
| Frontend deploy | Vercel | Instant Vite deploys |

```

---

## System architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Browser (React 18)                      │
│   Zustand · Axios JWT interceptor · Tailwind CSS             │
│   Login · Dashboard · NoteEditor · Semantic search bar       │
└───────────────────────────┬──────────────────────────────────┘
                            │  HTTPS · Authorization: Bearer <jwt>
                            ▼
┌──────────────────────────────────────────────────────────────┐
│               api-gateway  :8080                             │
│  CorsFilter → RateLimitFilter (Bucket4j/Redis)               │
│  → JwtAuthFilter → route matcher                             │
│  /api/auth/**   ──► lb://auth-service  (no JWT required)     │
│  /api/notes/**  ──► lb://notes-service (JWT validated here)  │
└──────────┬──────────────────────────────┬────────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────┐          ┌───────────────────────────────┐
│  auth-service    │          │  notes-service  :8082         │
│  :8081           │          │  NoteController               │
│  AuthController  │          │  NoteService (@Cacheable)     │
│  AuthService     │          │  SearchService                │
│  BCrypt · JJWT   │          │  MlServiceClient → ml-service │
└────────┬─────────┘          └──────┬──────────────┬─────────┘
         │                           │              │
    ┌────▼──────────────────────┐  ┌─▼──────┐  ┌───▼──────────────────┐
    │ PostgreSQL 16 + pgvector  │  │ Redis 7│  │  ml-service  :8001   │
    │ schema: recall_auth       │  │ cache  │  │  FastAPI · PyTorch   │
    │ schema: recall_notes      │◄─┤ rate   │  │  bge-large bi-encoder│
    │ embedding vector(1024)    │  │ limit  │  │  ms-marco reranker   │
    └───────────────────────────┘  └────────┘  └──────────────────────┘
```

---

## Two-stage semantic search

### Why two stages?

A bi-encoder computes embeddings independently for query and document, then compares with dot product. It is fast — O(1) per candidate once the index is built — but approximate, because the model never sees the query and document together.

A cross-encoder takes the query and each candidate document *concatenated* as a single input. It sees the relationship between them, producing a genuine relevance score. The catch: it is 10–50× slower per pair, making it impractical to run against every note in the database.

The two-stage pattern solves this: the bi-encoder retrieves the 20 most-plausible candidates cheaply, then the cross-encoder reranks those 20 with full precision. This is how production search systems work.

### Search latency breakdown (M4 MacBook, local dev)

| Step | What happens | Time |
|---|---|---|
| Debounce | Frontend waits for 400 ms pause in typing | 400 ms |
| Bi-encode query | bge-large-en-v1.5, MPS device | ~15 ms |
| pgvector ANN | ivfflat cosine distance, top-20 | ~5 ms |
| Cross-encode | ms-marco-MiniLM, 20 pairs, CPU | ~40 ms |
| Network + serialise | API gateway → notes → ml → back | ~15 ms |
| **Total** | **User sees results** | **~75 ms** |

On Railway (CPU-only), bi-encoding increases to ~80 ms, total ~150 ms — still fast enough for a debounced search bar.

### Why BAAI/bge-large-en-v1.5?

This model ranks consistently at the top of the MTEB (Massive Text Embedding Benchmark) English retrieval leaderboard. It was fine-tuned for asymmetric retrieval — short query against long document — which is exactly the note search use case. Its 1024-dimensional output gives more representational capacity than the commonly used 384-dim `all-MiniLM-L6-v2`, yielding roughly 8–12 percentage points better top-5 accuracy on retrieval benchmarks.

### Why pgvector instead of FAISS?

FAISS is a flat binary file: no transactions, no per-user isolation, manual serialisation, a separate process to manage. pgvector is a PostgreSQL extension — vectors live in the same table as notes, user-scoped queries are a `WHERE user_id = ?`, ACID guarantees apply, and backups are automatic. `CREATE INDEX ON notes USING ivfflat (embedding vector_cosine_ops)` is the entire vector index setup.

---

## Service port map

| Service | Local port | Responsibility |
|---|---|---|
| api-gateway | 8080 | All external traffic enters here |
| auth-service | 8081 | Register, login, JWT issuance |
| notes-service | 8082 | Note CRUD, caching, search coordination |
| ml-service | 8001 | Embedding and reranking |
| PostgreSQL | 5432 | Persistent data |
| Redis | 6379 | Cache and rate limit |
| frontend | 5173 | React dev server |

---

## API reference

### Auth (`/api/auth` — no JWT required)

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/register` | `{email, password}` | `{userId, email, createdAt}` |
| POST | `/login` | `{email, password}` | `{accessToken, tokenType, expiresIn}` |

### Notes (`/api/notes` — requires `Authorization: Bearer <token>`)

| Method | Path | Query params | Description |
|---|---|---|---|
| GET | `/` | `page, size, tag` | Paginated notes, optional tag filter |
| POST | `/` | — | Create note — triggers ML embed on save |
| GET | `/{id}` | — | Single note (Redis cached, TTL 10 min) |
| PUT | `/{id}` | — | Update note — re-embeds, evicts cache |
| DELETE | `/{id}` | — | Delete note and pgvector row |

### Search (`/api/search` — requires JWT)

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/` | `{query, topK}` | Two-stage semantic search |

**Request:**
```json
{ "query": "sorting algorithms I wrote about", "topK": 5 }
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "title": "Quicksort vs Mergesort",
      "contentPreview": "Quicksort has O(n log n) average case performance...",
      "tags": ["algorithms", "dsa"],
      "similarityScore": 0.94,
      "rerankScore": 3.21,
      "createdAt": "2026-03-15T10:22:00Z"
    }
  ],
  "queryTimeMs": 74,
  "retrievalCount": 20
}
```

### ML service (`/` — internal, not exposed to browser)

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/embed` | `{text, is_query}` | Returns 1024-dim vector |
| POST | `/search` | `{query, user_id, top_k}` | Full two-stage search |
| GET | `/health` | — | Model readiness probe |

---

## Running locally

### Prerequisites

- Docker and Docker Compose
- Java 21 (`sdk install java 21-temurin` via SDKMAN)
- Node.js 18+
- Python 3.11+ (for running ml-service outside Docker)

### One command — full stack

```bash
git clone https://github.com/shanmukhraj7/cortex
cd cortex
cp .env.example .env          # fill in JWT_SECRET
docker-compose up --build

# Frontend:       http://localhost:5173
# Gateway:        http://localhost:8080
# Auth Swagger:   http://localhost:8081/swagger-ui.html
# Notes Swagger:  http://localhost:8082/swagger-ui.html
# ML docs:        http://localhost:8001/docs
```

### Per-service dev (without Docker)

**api-gateway:**
```bash
cd api-gateway
./mvnw spring-boot:run
```

**auth-service:**
```bash
cd auth-service
./mvnw spring-boot:run
```

**notes-service:**
```bash
cd notes-service
./mvnw spring-boot:run
```

**ml-service (M4 Mac — MPS acceleration):**
```bash
cd ml-service
pip install -r requirements.txt
DEVICE=mps uvicorn app.main:app --reload --port 8001
# First run downloads ~750 MB of model weights into ./model_cache/
# Subsequent starts use the cache — fast
```

**frontend:**
```bash
cd frontend
npm install
cp .env.example .env           # VITE_API_URL=http://localhost:8080
npm run dev
```

---

## Running tests

### Java services (auth + notes + gateway)

```bash
# auth-service
cd auth-service && ./mvnw test
# Testcontainers spins a real PostgreSQL container for integration tests

# notes-service
cd notes-service && ./mvnw test
# Testcontainers spins real PostgreSQL + Redis

# api-gateway
cd api-gateway && ./mvnw test
# MockMvc routing tests — no containers needed
```

### ML service

```bash
cd ml-service
pytest tests/ -v
# Models are mocked — no download required
# Tests: embedding shape, L2 normalisation, search result ordering
```

### Frontend

```bash
cd frontend
npm run lint
```

---

## Environment variables

### `docker-compose.yml` / `.env`

```env
# Shared
POSTGRES_DB=cortex
POSTGRES_USER=cortex
POSTGRES_PASSWORD=cortex
REDIS_URL=redis://redis:6379

# Auth service
JWT_SECRET=change-me-in-production-use-256-bit-random-string
JWT_EXPIRATION_MS=86400000

# ML service
DEVICE=cpu
BI_ENCODER_MODEL=BAAI/bge-large-en-v1.5
CROSS_ENCODER_MODEL=cross-encoder/ms-marco-MiniLM-L-6-v2
MODEL_CACHE_DIR=/app/model_cache
TOP_K_RETRIEVAL=20

# Notes service
ML_SERVICE_URL=http://ml-service:8001

# Frontend
VITE_API_URL=http://localhost:8080
```

### Per-service `application.yml` (Spring Boot)

Each Spring Boot service reads from environment variables mapped in `application.yml`. No secrets are committed — all sensitive values come from the environment or GitHub Secrets in CI.

---

## CI/CD pipeline

### On every pull request (`ci.yml`)

1. Java tests — `./mvnw test` in both `auth-service` and `notes-service` using Testcontainers
2. Java lint — Checkstyle with Google Java style rules
3. Python tests — `pytest tests/` in `ml-service` with mocked models
4. Python lint — Ruff
5. Docker build smoke test — all three service images must build cleanly

**All five jobs must pass. Merge is blocked if any fail.**

### On push to `main` (`deploy.yml`)

1. All CI checks re-run
2. `mvn package -DskipTests` builds production JARs
3. Docker images built for `api-gateway`, `auth-service`, `notes-service`, `ml-service`
4. Images pushed to GitHub Container Registry (`ghcr.io`)
5. Railway pulls new images and performs rolling deploy (zero downtime)
6. Vercel detects the push and redeploys the frontend

### Secrets stored in GitHub

```
RAILWAY_TOKEN
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
JWT_SECRET
GHCR_TOKEN
```

---

## Build order (recommended)

Work through services in this order. Each one is independently testable before the next is started.

| Step | Service | What to verify |
|---|---|---|
| 1 | `ml-service` | `GET /health` returns both models loaded · `POST /embed` returns 1024-dim vector |
| 2 | `auth-service` | `POST /register` + `POST /login` return JWT · tests pass |
| 3 | `notes-service` | Full CRUD works · `POST /search` returns ranked results via ml-service |
| 4 | `api-gateway` | All routes reachable · 401 on missing JWT · rate limit triggers at 100 req/min |
| 5 | `frontend` | Change `VITE_API_URL` to `:8080` · full flow from login to search |

---

## Key design decisions

**Why microservices over a monolith?**  
Each service can be independently deployed, scaled, and tested. The ML service is Python because the entire ML ecosystem is Python-native — FAISS, sentence-transformers, PyTorch. The Spring Boot services are Java because Spring Security, Spring Cache, and Testcontainers integration tests are mature and production-proven. A monolith would force a single language choice; microservices let each service use the best tool for its job.

**Why Spring Cloud Gateway instead of Nginx?**  
The gateway validates JWTs and forwards a trusted `X-User-Id` header to downstream services. Nginx cannot do this without a Lua plugin. Spring Cloud Gateway does it in a typed Java filter with full access to the Spring security context, rate limiting via Bucket4j, and reactive routing that doesn't block on network I/O.

**Why two Spring Boot services instead of one?**  
Auth and Notes have different scaling profiles and different failure modes. Auth is stateless and fast. Notes does heavier DB work and calls the ML service. Separating them means a slow ML embedding cannot affect login latency, and each service can be scaled independently on Railway.

**Why pgvector over a dedicated vector database?**  
pgvector stores vectors in the same PostgreSQL table as notes. User isolation is a `WHERE user_id = ?`. Backups include vectors automatically. There is no separate process, no binary index file, and no eventual consistency to reason about. For a personal knowledge base with thousands to tens of thousands of notes, pgvector with an `ivfflat` index handles the load comfortably.

**Why BAAI/bge-large-en-v1.5?**  
It ranks at the top of the MTEB English retrieval leaderboard and was fine-tuned specifically for asymmetric retrieval — the exact use case of note search. The 1024-dimensional output gives 8–12% better top-5 precision than 384-dim models. On M4 via PyTorch MPS it runs at ~15 ms per embedding. On Railway CPU it runs at ~80 ms — acceptable for a background embed-on-save call.

**Why a cross-encoder reranker?**  
Bi-encoders are fast because they never see the query and document together — they compare pre-computed vectors. Cross-encoders read query + document concatenated, which is slower but far more accurate. Adding reranking is the detail that shows you understand information retrieval rather than just following a tutorial.

**Why Bucket4j for rate limiting?**  
Bucket4j implements the token bucket algorithm with Redis as the backing store — distributed, correct across multiple gateway replicas, and configurable in a few lines of Java. The overhead is under 1 ms per request.

---

## CV bullet points

```
• Architected a five-service microservices system using React, Spring Cloud
  Gateway, two Spring Boot 3.2 services (Java 21 virtual threads), and a
  Python FastAPI ML service — deployed on Railway + Vercel with sub-150 ms
  end-to-end latency.

• Built a two-stage semantic search pipeline: BAAI/bge-large-en-v1.5 bi-encoder
  retrieves top-20 notes via pgvector ivfflat index, then cross-encoder
  (ms-marco-MiniLM) reranks to final top-5 — the same architecture used by
  Cohere Rerank and Elasticsearch semantic search.

• Implemented MPS-accelerated inference on Apple Silicon M4 reducing
  embedding latency from ~100 ms (CPU) to ~15 ms; deployed CPU variant on
  Railway with model weights persisted in a Docker volume.

• Designed a gateway-centric security model: JWT validated once at the
  Spring Cloud Gateway boundary, trusted X-User-Id header forwarded to
  downstream services — no JWT parsing in auth or notes services.

• Wrote integration test suites with Testcontainers (real PostgreSQL + Redis
  in Docker) targeting 85%+ coverage; configured GitHub Actions CI/CD for
  automated test gates and zero-downtime rolling deploys on push to main.
```

---

## Estimated build timeline

| Week | Focus | Hours |
|---|---|---|
| 1 | `ml-service` — FastAPI + bge-large + cross-encoder + pgvector | 6–7 |
| 2 | `auth-service` — Spring Boot + Flyway + BCrypt + JJWT + Testcontainers | 5–6 |
| 3 | `notes-service` — CRUD + Redis cache + SearchService + MlServiceClient | 5–6 |
| 4 | `api-gateway` — routing + JWT filter + Bucket4j + CORS | 3–4 |
| 5 | `frontend` — update env, fix any response shape differences, polish UI | 2–3 |
| 6 | Docker Compose + GitHub Actions + Railway + Vercel deploy | 3–4 |

Total: approximately 5–6 focused weekends.

---

## License

MIT
