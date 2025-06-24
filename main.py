from fastapi import FastAPI
from routers.ingest_email import router as ingest_email_router

app = FastAPI()

app.include_router(ingest_email_router) 