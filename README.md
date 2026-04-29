# Cortex — AI-Powered Personal Knowledge Base

> A production-grade microservices application: React frontend, Spring Cloud Gateway, two Spring Boot services, and a Python ML microservice delivering two-stage semantic search (bi-encoder retrieval + cross-encoder reranking) with Apple Silicon MPS acceleration.

**GitHub:** https://github.com/shanmukhraj7/Cortex

---

## What is Cortex?

Cortex is a personal knowledge base where you write, organise, and retrieve notes using **natural language**, not keywords.

Searching *"deep learning tricks I wrote about"* surfaces a note titled *"Batch normalisation and dropout techniques"* — even though none of those words appear in your query. Every note is converted to a semantic vector when saved, and search operates in that 1024-dimensional space rather than on raw text.

The two-stage retrieval pipeline mirrors what production search systems (Cohere Rerank, Elasticsearch semantic search) actually do: a fast bi-encoder retrieves 20 candidates using an HNSW vector index, then a precise cross-encoder reranks them to the final top-5. This distinction — understanding *why* you need two stages — is the difference between a tutorial and a real information retrieval system.

---

## Repository layout

```text
Cortex/
├── frontend/                   React 18 + Vite + Tailwind CSS (Dark Coral Aesthetic) + Zustand
├── api-gateway/                Spring Cloud Gateway 4 — routing, JWT, rate limiting
├── auth-service/               Spring Boot 3.2 — register, login, JWT issuance
├── notes-service/              Spring Boot 3.2 — CRUD, cache, search coordination
├── ml-service/                 Python 3.11 + FastAPI — embeddings + reranking
├── .github/
│   └── workflows/
│       ├── ci.yml              PR gate: Java tests + Python tests + Docker build
│       └── deploy.yml          main: build → GHCR → deployment
├── docker-compose.yml          full local dev stack — one command
├── docker-compose.prod.yml     production config
└── README.md                   this file
```

---

## Project Structure
```text
Cortex/
├── api-gateway/                   Spring Cloud Gateway
│   ├── src/main/java/com/cortex/gateway/
│   │   ├── GatewayApplication.java
│   │   ├── JwtAuthFilter.java              validates JWT on every request
│   │   ├── RateLimitFilter.java            Bucket4j + Redis rate limiting
│   │   └── config/
│   │       ├── CorsConfig.java
│   │       ├── GatewayConfig.java          route definitions
│   │       ├── RedisConfig.java
│   │       └── SecurityConfig.java         Security filter chain
│   ├── src/main/resources/application.yml
│   └── pom.xml
│
├── auth-service/                  Spring Boot 3.2
│   ├── src/main/java/com/cortex/auth/
│   │   ├── AuthApplication.java
│   │   ├── controller/AuthController.java
│   │   ├── entity/User.java
│   │   ├── exception/GlobalExceptionHandler.java
│   │   ├── repository/UserRepository.java
│   │   ├── security/
│   │   │   ├── JwtService.java             JWT generation and validation
│   │   │   └── SecurityConfig.java         Authentication provider setup
│   │   └── service/AuthService.java        BCrypt password hashing
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/V1__create_users.sql
│   ├── src/test/...
│   ├── Dockerfile
│   └── pom.xml
│
├── notes-service/                 Spring Boot 3.2
│   ├── src/main/java/com/cortex/notes/
│   │   ├── NotesApplication.java
│   │   ├── client/MLServiceClient.java     RestClient HTTP caller to ML Service
│   │   ├── config/
│   │   │   ├── CorsConfig.java
│   │   │   ├── RedisConfig.java
│   │   │   ├── ResilienceConfig.java       Circuit Breaker settings
│   │   │   └── SecurityConfig.java
│   │   ├── controller/
│   │   │   ├── NoteController.java
│   │   │   └── SearchController.java
│   │   ├── dto/                            Request & Response Records
│   │   ├── entity/Note.java
│   │   ├── exception/GlobalExceptionHandler.java
│   │   ├── repository/NoteRepository.java  JPA + native pgvector (HNSW) query
│   │   ├── security/
│   │   │   ├── JwtContextFilter.java       reads user ID from forwarded JWT header
│   │   │   └── UserContext.java
│   │   └── service/
│   │       ├── NoteService.java            @Cacheable / @CacheEvict
│   │       └── SearchService.java          calls ml-service
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/
│   │       ├── V1__create_notes.sql
│   │       ├── V2__add_pgvector.sql
│   │       └── V3__replace_ivfflat_with_hnsw.sql
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
│   │   │   ├── embedder.py                 BAAI/bge-large-en-v1.5 + MPS
│   │   │   └── reranker.py                 cross-encoder/ms-marco-MiniLM
│   │   └── routers/
│   │       ├── embed.py                    POST /embed
│   │       └── search.py                   POST /search
│   ├── tests/...
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   └── README.md
│
├── frontend/                      React + Vite (Custom Dark Coral Design)
│   ├── src/
│   │   ├── components/            UI components (Button, Modal, NoteCard, etc)
│   │   ├── pages/                 Dashboard, Login, Register
│   │   ├── store/                 Zustand state (authStore, notesStore)
│   │   └── utils/
│   ├── tailwind.config.js
│   └── package.json
│
├── docker-compose.yml
├── .github/
└── README.md
```

---

## Tech stack
| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Zustand | Fast iteration, Dark Coral UI with Syne typography |
| HTTP client | Axios | JWT interceptors, 401 redirect, timeout |
| Gateway | Spring Cloud Gateway 4, Java 21 | Reactive routing, JWT filter, Bucket4j rate limiting |
| Auth service | Spring Boot 3.2, Spring Security 6, JJWT, BCrypt | Battle-tested JWT + password hashing |
| Notes service | Spring Boot 3.2, Spring Data JPA, Spring Cache | @Cacheable annotations, virtual threads |
| DB migrations | Flyway | Versioned, reproducible SQL schema |
| Cache + rate limit | Redis 7, Bucket4j | Token-bucket rate limit, TTL-based note cache |
| Database | PostgreSQL 16 + pgvector | Notes + 1024-dim vectors (HNSW indexed) in one ACID store |
| ML framework | Python 3.11, FastAPI, PyTorch | MPS GPU on Apple Silicon, CPU fallback in Docker |
| Bi-encoder | BAAI/bge-large-en-v1.5 | No. 1 MTEB retrieval; 1024-dim; ~15 ms/embed on M4 |
| Cross-encoder | cross-encoder/ms-marco-MiniLM-L-6-v2 | Reranks top-20 → top-5 with 8–12 pt precision gain |
| API docs | SpringDoc OpenAPI 3 | Auto Swagger UI per service |
| Testing — Java | JUnit 5, Testcontainers, MockMvc | Real PostgreSQL + Redis in Docker during tests |
| Testing — Python | pytest, httpx | Embedding accuracy, search ranking order |
| CI/CD | GitHub Actions | PR gate + automated tests |
| Containers | Docker, Docker Compose | One-command local dev and production deployment |

---

## System architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                      Browser (React 18)                      │
│   Zustand · Axios JWT interceptor · Tailwind CSS             │
│   Login · Dashboard · NoteEditor · Semantic search bar       │
└───────────────────────────┬──────────────────────────────────┘
                            │  HTTPS · Authorization: Bearer <jwt>
                            ▼
┌──────────────────────────────────────────────────────────────┐
│               api-gateway  :8080                             │
│  CorsConfig → RateLimitFilter (Bucket4j/Redis)               │
│  → JwtAuthFilter → route matcher                             │
│  /api/auth/**   ──► lb://auth-service  (no JWT required)     │
│  /api/notes/**  ──► lb://notes-service (JWT validated here)  │
│  /api/search/** ──► lb://notes-service (JWT validated here)  │
└──────────┬──────────────────────────────┬────────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────┐          ┌───────────────────────────────┐
│  auth-service    │          │  notes-service  :8082         │
│  :8081           │          │  NoteController               │
│  AuthController  │          │  SearchController             │
│  AuthService     │          │  NoteService (@Cacheable)     │
│  BCrypt · JJWT   │          │  SearchService                │
│                  │          │  MLServiceClient → ml-service │
└────────┬─────────┘          └──────┬──────────────┬─────────┘
         │                           │              │
    ┌────▼──────────────────────┐  ┌─▼──────┐  ┌───▼──────────────────┐
    │ PostgreSQL 16 + pgvector  │  │ Redis 7│  │  ml-service  :8001   │
    │ schema: cortex_auth       │  │ cache  │  │  FastAPI · PyTorch   │
    │ schema: cortex_notes      │◄─┤ rate   │  │  bge-large bi-encoder│
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
| pgvector ANN | HNSW cosine distance, top-20 | ~2 ms |
| Cross-encode | ms-marco-MiniLM, 20 pairs, CPU | ~40 ms |
| Network + serialise | API gateway → notes → ml → back | ~15 ms |
| **Total** | **User sees results** | **~72 ms** |

### Why BAAI/bge-large-en-v1.5?
This model ranks consistently at the top of the MTEB (Massive Text Embedding Benchmark) English retrieval leaderboard. It was fine-tuned for asymmetric retrieval — short query against long document — which is exactly the note search use case. Its 1024-dimensional output gives more representational capacity than the commonly used 384-dim `all-MiniLM-L6-v2`, yielding roughly 8–12 percentage points better top-5 accuracy on retrieval benchmarks.

### Why pgvector instead of FAISS?
FAISS is a flat binary file: no transactions, no per-user isolation, manual serialisation, a separate process to manage. pgvector is a PostgreSQL extension — vectors live in the same table as notes, user-scoped queries are a `WHERE user_id = ?`, ACID guarantees apply, and backups are automatic. With the modern **HNSW index**, retrieval speed matches FAISS while keeping all the operational benefits of Postgres.

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

---

## Running locally

### Prerequisites

- Docker and Docker Compose
- Java 21
- Node.js 18+
- Python 3.11+

### One command — full stack

```bash
git clone https://github.com/shanmukhraj7/Cortex
cd Cortex
cp .env.example .env          # fill in JWT_SECRET
docker compose up --build -d

# Frontend:       http://localhost:5173
# Gateway:        http://localhost:8080
# Auth Swagger:   http://localhost:8081/swagger-ui.html
# Notes Swagger:  http://localhost:8082/swagger-ui.html
# ML docs:        http://localhost:8001/docs
```

---

## Key design decisions

**Why microservices over a monolith?**  
Each service can be independently deployed, scaled, and tested. The ML service is Python because the entire ML ecosystem is Python-native. The Spring Boot services are Java because Spring Security, Spring Cache, and Testcontainers integration tests are mature and production-proven.

**Why Spring Cloud Gateway instead of Nginx?**  
The gateway validates JWTs and forwards a trusted `X-User-Id` header to downstream services. Nginx cannot do this natively. Spring Cloud Gateway does it in a typed Java filter with full access to the Spring security context, rate limiting via Bucket4j, and reactive routing.

**Why Bucket4j for rate limiting?**  
Bucket4j implements the token bucket algorithm with Redis as the backing store — distributed, correct across multiple gateway replicas, and configurable in a few lines of Java. The overhead is under 1 ms per request.

---

## License

MIT
