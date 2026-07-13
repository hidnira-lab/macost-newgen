from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from routers import (
    allocations,
    auth,
    categories,
    dashboard,
    goals,
    insights,
    receipts,
    saw_weights,
    statements,
    transactions,
    wallets,
)

app = FastAPI(title="Macost API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(goals.router, prefix="/api")
app.include_router(allocations.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(receipts.router, prefix="/api")
app.include_router(statements.router, prefix="/api")
app.include_router(wallets.router, prefix="/api")
app.include_router(saw_weights.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Macost API running"}


@app.get("/health")
def health():
    return {"status": "ok"}
