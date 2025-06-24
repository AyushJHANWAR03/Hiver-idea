import openai
import os
from db.mongo import emails_collection
from pymongo.errors import PyMongoError
from models.email import EmailIngest
from fastapi import HTTPException
from bson import ObjectId
from bson.errors import InvalidId

openai.api_key = os.getenv("OPENAI_API_KEY")

INTENT_CATEGORIES = [
    "Refund",
    "Complaint",
    "Order Status",
    "Product Query",
    "Partnership",
    "Other"
]

INTENT_TEAM_MAP = {
    "Refund": "refunds_team",
    "Complaint": "support_team",
    "Order Status": "ops_team",
    "Product Query": "product_team",
    "Partnership": "bizdev_team",
    "Other": "general_queue"
}

class EmailService:
    @staticmethod
    async def ingest_email(email: EmailIngest):
        email_dict = email.dict(by_alias=True)
        # Improved prompt for GPT
        prompt = (
            "You are an email assistant.\n"
            "Classify the intent of the following email into one of these categories: Refund, Complaint, Order Status, Product Query, Partnership, Other.\n"
            "Then, generate a 1-line summary of the email.\n"
            "Email:\n"
            f"Subject: {email.subject}\n"
            f"From: {email.from_}\n"
            f"Body: {email.body}\n"
            "Respond ONLY in valid JSON with keys 'intent' and 'summary'."
        )

        print("GPT Prompt:", prompt)
        intent = "Other"
        summary = ""

        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.2
            )
            gpt_content = response["choices"][0]["message"]["content"]
            print("GPT Raw Response:", gpt_content)

            import json
            gpt_result = json.loads(gpt_content)
            intent = gpt_result.get("intent", "Other")
            summary = gpt_result.get("summary", "")
            print("Parsed intent:", intent)
            print("Parsed summary:", summary)
        except Exception as e:
            print(f"Failed to get or parse AI response: {e}")

        assigned_team = INTENT_TEAM_MAP.get(intent, "general_queue")
        
        email_dict["intent"] = intent
        email_dict["summary"] = summary
        email_dict["assigned_team"] = assigned_team
        email_dict["manual_override"] = False
        
        print("Final MongoDB document:", email_dict)
        
        result = await emails_collection.insert_one(email_dict)
        
        created_doc = await emails_collection.find_one({"_id": result.inserted_id})
        return created_doc

    @staticmethod
    async def reassign_email(email_id: str, new_team: str):
        try:
            object_id = ObjectId(email_id)
        except InvalidId:
            return None

        result = await emails_collection.update_one(
            {"_id": object_id},
            {"$set": {"assigned_team": new_team, "manual_override": True}}
        )

        if result.matched_count == 0:
            return None

        return await emails_collection.find_one({"_id": object_id})

    @staticmethod
    async def generate_reply(email_id: str):
        try:
            object_id = ObjectId(email_id)
        except InvalidId:
            return None

        email_doc = await emails_collection.find_one({"_id": object_id})
        if not email_doc:
            return None

        prompt = f"""You are a helpful support agent. Write a polite and helpful email reply to the following customer message.
Use the context provided to craft an appropriate response.

Original Email Subject: {email_doc.get('subject')}
Original Email: {email_doc.get('body')}
Intent Classification: {email_doc.get('intent')}
Assigned Team: {email_doc.get('assigned_team')}

Write a professional reply that addresses the customer's concerns. The reply should be:
1. Polite and empathetic
2. Direct and clear
3. Actionable with next steps if needed
4. In a professional tone

Reply:"""

        print("GPT Prompt for reply:", prompt)
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.7
            )
            reply_content = response["choices"][0]["message"]["content"].strip()
            print("Generated Reply:", reply_content)

            return {
                "email_id": email_id,
                "original_subject": email_doc.get("subject"),
                "original_body": email_doc.get("body"),
                "generated_reply": reply_content
            }
        except Exception as e:
            print(f"Failed to generate reply: {e}")
            return None 

    @staticmethod
    async def save_reply(email_id: str, reply: str):
        try:
            object_id = ObjectId(email_id)
        except InvalidId:
            return None
        email_doc = await emails_collection.find_one({"_id": object_id})
        if not email_doc:
            return None
        result = await emails_collection.update_one(
            {"_id": object_id},
            {"$set": {"agent_reply": reply}}
        )
        if result.modified_count == 1:
            return True
        else:
            raise Exception("Failed to update the document.") 

    @staticmethod
    async def generate_feedback(email_id: str):
        try:
            object_id = ObjectId(email_id)
        except Exception:
            return None
        email_doc = await emails_collection.find_one({"_id": object_id})
        if not email_doc:
            return None
        agent_reply = email_doc.get("agent_reply")
        if not agent_reply:
            return "no_reply"
        prompt = f"""Analyze the following email reply and rate it on:
- Tone (e.g., Polite, Rude, Neutral)
- Clarity (Clear, Moderate, Confusing)
- Helpfulness (High, Medium, Low)

Reply:
{agent_reply}

Return the response in JSON format with keys: tone, clarity, helpfulness."""
        print("GPT Prompt for feedback:", prompt)
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.2
            )
            feedback_content = response["choices"][0]["message"]["content"]
            print("GPT Feedback Response:", feedback_content)
            import json
            feedback = json.loads(feedback_content)
            return feedback
        except Exception as e:
            print(f"Failed to generate feedback: {e}")
            return None 