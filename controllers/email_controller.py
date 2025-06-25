from fastapi import APIRouter, HTTPException, Path, Body
from models.email import EmailIngest
from services.email_service import EmailService
from pymongo.errors import PyMongoError
from typing import Dict
import random

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

@router.get("/emails")
async def get_recent_emails():
    try:
        emails = await EmailService.get_recent_emails()
        return emails
    except Exception as e:
        print(f"Error fetching recent emails: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch recent emails.")

@router.get("/emails/{email_id}")
async def get_email(email_id: str = Path(..., title="The ID of the email to get")):
    try:
        email = await EmailService.get_email_by_id(email_id)
        if email is None:
            raise HTTPException(status_code=404, detail="Email not found")
        return email
    except Exception as e:
        print(f"Error fetching email {email_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch email.")

@router.get("/generate-random-email")
async def generate_random_email():
    subjects = [
        "Issue with product quality",
        "Request for refund",
        "Order not delivered",
        "Product inquiry",
        "Partnership proposal"
    ]
    bodies = [
        "Hey, I recently bought a product from your store, but it stopped working within a week. I tried troubleshooting as per the manual, but nothing worked. Can you help me with a replacement or refund? I am disappointed as I expected better quality from your brand. Please let me know the next steps and how soon this can be resolved.",
        "I placed an order two weeks ago and it still hasn't arrived. The tracking information hasn't updated in several days, and I'm starting to get worried. Could you please provide an update on the status of my order? If there are any issues, I would appreciate a prompt resolution or a refund if the item cannot be delivered soon.",
        "I'm interested in learning more about your product features, especially regarding compatibility with other devices I own. Could you send me detailed specifications and any user manuals available? Also, are there any current promotions or discounts for first-time buyers?",
        "We are interested in a partnership with your company. Our team believes there is a strong synergy between our services and your product offerings. Please let us know the next steps for initiating a formal discussion, and if you have any partnership decks or case studies, kindly share them as well.",
        "I received a damaged item in my recent order. The packaging was intact, but the product inside was broken and unusable. I have attached photos for your reference. I would like to request a full refund or a replacement as soon as possible. Please advise on how to proceed and whether you need the damaged item returned."
    ]
    emails = [
        "customer1@example.com",
        "user2@example.com",
        "partner@company.com",
        "complaintbox@example.net",
        "info@randommail.com"
    ]
    return {
        "subject": random.choice(subjects),
        "body": random.choice(bodies),
        "from": random.choice(emails)
    } 