from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.ingest_email import router as ingest_email_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest_email_router)