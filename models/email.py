from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

class EmailIngest(BaseModel):
    subject: str = Field(..., min_length=1)
    body: str = Field(..., min_length=1)
    from_: EmailStr = Field(..., alias="from")
    timestamp: datetime 