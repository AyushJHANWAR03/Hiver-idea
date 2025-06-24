from fastapi import APIRouter, HTTPException, Path, Body
from models.email import EmailIngest
from services.email_service import EmailService
from pymongo.errors import PyMongoError
from typing import Dict

router = APIRouter()

@router.post("/ingest-email")
async def ingest_email(email: EmailIngest):
    try:
        created_doc = await EmailService.ingest_email(email)
        if not created_doc:
            raise HTTPException(status_code=500, detail="Failed to create email record.")

        return {
            "inserted_id": str(created_doc["_id"]),
            "intent": created_doc.get("intent"),
            "summary": created_doc.get("summary"),
            "assigned_team": created_doc.get("assigned_team")
        }
    except PyMongoError as e:
        print(f"Database error during ingestion: {e}")
        raise HTTPException(status_code=500, detail="A database error occurred.")
    except Exception as e:
        print(f"An unexpected error occurred during ingestion: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

@router.post("/reassign-email/{email_id}")
async def reassign_email(email_id: str = Path(...), payload: dict = Body(...)):
    new_team = payload.get("new_team")
    if not new_team:
        raise HTTPException(status_code=400, detail="new_team must not be empty.")

    try:
        updated_doc = await EmailService.reassign_email(email_id, new_team)
        if updated_doc is None:
            raise HTTPException(status_code=404, detail="Email not found.")

        return {
            "message": "Email reassigned successfully.",
            "email_id": email_id,
            "assigned_team": updated_doc.get("assigned_team"),
            "manual_override": updated_doc.get("manual_override")
        }
    except Exception:
        raise HTTPException(status_code=500, detail="An unexpected error occurred during reassignment.")

@router.post("/generate-reply")
async def generate_reply(payload: Dict[str, str] = Body(...)):
    email_id = payload.get("email_id")
    if not email_id:
        raise HTTPException(status_code=400, detail="email_id is required")

    try:
        result = await EmailService.generate_reply(email_id)
        if result is None:
            raise HTTPException(status_code=404, detail="Email not found or failed to generate reply")

        return result
    except Exception as e:
        print(f"Error generating reply: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate reply")

@router.post("/save-reply/{email_id}")
async def save_reply(email_id: str = Path(...), payload: dict = Body(...)):
    reply = payload.get("reply")
    if not reply:
        raise HTTPException(status_code=400, detail="reply is required")
    try:
        result = await EmailService.save_reply(email_id, reply)
        if result is None:
            raise HTTPException(status_code=404, detail="Email not found.")
        return {"message": "Reply saved successfully."}
    except Exception as e:
        print(f"Error saving reply: {e}")
        raise HTTPException(status_code=500, detail="Failed to save reply.")

@router.post("/generate-feedback/{email_id}")
async def generate_feedback(email_id: str = Path(...)):
    try:
        feedback = await EmailService.generate_feedback(email_id)
        if feedback is None:
            raise HTTPException(status_code=404, detail="Email not found or feedback generation failed.")
        if feedback == "no_reply":
            raise HTTPException(status_code=400, detail="No agent reply found for this email.")
        return feedback
    except Exception as e:
        print(f"Error generating feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate feedback.") 