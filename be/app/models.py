from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from sqlmodel import Field, Relationship, SQLModel


def new_id() -> str:
    return str(uuid4())


class User(SQLModel, table=True):
    id: str = Field(default_factory=new_id, primary_key=True)
    name: Optional[str] = None
    email: str = Field(unique=True, index=True)
    password: str  # hashed (bcrypt), lihat app/security.py
    role: str = Field(default="author")  # "author" | "admin"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    articles: List["Article"] = Relationship(back_populates="author")


class Article(SQLModel, table=True):
    id: str = Field(default_factory=new_id, primary_key=True)
    title: str
    slug: str = Field(unique=True, index=True)
    content: str
    cover_image: Optional[str] = None
    published: bool = Field(default=False)
    author_id: str = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    author: Optional[User] = Relationship(back_populates="articles")
