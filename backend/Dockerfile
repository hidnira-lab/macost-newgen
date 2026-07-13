FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
# Shell form (not exec-array form) so $PORT expands -- Railway injects its
# own PORT at runtime and the container must bind to it, not a hardcoded
# 8000. Falls back to 8000 for `docker run` outside Railway. No --reload:
# that's a dev-only feature, added back explicitly by docker-compose's own
# `command:` override for local dev, not by this default.
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
