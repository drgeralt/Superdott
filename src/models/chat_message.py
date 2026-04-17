from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="chat_sessions.id", index=True)
    role: str  # "user" ou "assistant"

    content: str
    created_at: datetime | None = Field(default_factory=datetime.utcnow)