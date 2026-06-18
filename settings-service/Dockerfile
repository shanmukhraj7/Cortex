# ── Build stage ───────────────────────────────────────────────────────────────
FROM golang:1.23-alpine AS build

WORKDIR /app

# Download dependencies first (layer cache)
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build a statically linked binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -o settings-service \
    ./cmd/server

# ── Final stage ───────────────────────────────────────────────────────────────
FROM alpine:3.19

# CA certificates — needed for any future outbound HTTPS calls
RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=build /app/settings-service ./settings-service

EXPOSE 8083

ENTRYPOINT ["/app/settings-service"]
