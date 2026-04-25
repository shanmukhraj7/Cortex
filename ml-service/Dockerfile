FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
 && rm -rf /var/lib/apt/lists/*

COPY requirements-cpu.txt .

# CPU-only torch from the PyTorch index, then everything else
RUN pip install --no-cache-dir \
    torch==2.6.0+cpu \
    --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements-cpu.txt

COPY app/ ./app/

VOLUME ["/app/model_cache"]

ENV PYTHONUNBUFFERED=1
ENV DEVICE=cpu

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]