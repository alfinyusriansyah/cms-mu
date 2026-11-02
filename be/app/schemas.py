from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)


class UserPublic(BaseModel):
    id: str
    name: Optional[str]
    email: str
    role: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class ArticleCreate(BaseModel):
    title: str = Field(min_length=3)
    content: str = Field(min_length=1)
    cover_image: Optional[str] = None
    published: bool = False


class ArticleUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3)
    content: Optional[str] = Field(default=None, min_length=1)
    cover_image: Optional[str] = None
    published: Optional[bool] = None


class ArticlePublic(BaseModel):
    id: str
    title: str
    slug: str
    content: str
    coverImage: Optional[str] = Field(default=None, alias="cover_image")
    published: bool
    authorId: str = Field(alias="author_id")
    createdAt: datetime = Field(alias="created_at")
    updatedAt: datetime = Field(alias="updated_at")

    class Config:
        from_attributes = True
        populate_by_name = True
