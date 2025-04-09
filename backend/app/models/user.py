from pydantic import BaseModel
from datetime import datetime

class User(BaseModel):
    username: str
    email: str
    created_at: datetime = datetime.now() 