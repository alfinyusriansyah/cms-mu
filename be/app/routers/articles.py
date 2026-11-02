from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.deps import get_current_user, get_current_user_optional
from app.models import Article, User
from app.schemas import ArticleCreate, ArticlePublic, ArticleUpdate
from app.slug import slugify, with_random_suffix

router = APIRouter(prefix="/articles", tags=["articles"])


# GET /articles              -> list artikel published (publik)
# GET /articles?mine=true    -> list artikel milik user yang login (butuh token)
@router.get("", response_model=List[ArticlePublic])
def list_articles(
    mine: bool = False,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    if mine:
        if not current_user:
            raise HTTPException(status_code=401, detail="Unauthorized")
        statement = select(Article).where(Article.author_id == current_user.id)
    else:
        statement = select(Article).where(Article.published == True)  # noqa: E712

    articles = session.exec(statement.order_by(Article.created_at.desc())).all()
    return articles


@router.post("", response_model=ArticlePublic, status_code=201)
def create_article(
    payload: ArticleCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    base_slug = slugify(payload.title)
    article = Article(
        title=payload.title,
        content=payload.content,
        cover_image=payload.cover_image,
        published=payload.published,
        slug=with_random_suffix(base_slug),
        author_id=current_user.id,
    )
    session.add(article)
    session.commit()
    session.refresh(article)
    return article


@router.get("/{article_id}", response_model=ArticlePublic)
def get_article(article_id: str, session: Session = Depends(get_session)):
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")
    return article


@router.put("/{article_id}", response_model=ArticlePublic)
def update_article(
    article_id: str,
    payload: ArticleUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")
    if article.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(article, field, value)
    article.updated_at = datetime.utcnow()  # SQLModel tidak auto-set seperti @updatedAt Prisma

    session.add(article)
    session.commit()
    session.refresh(article)
    return article


@router.delete("/{article_id}")
def delete_article(
    article_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")
    if article.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    session.delete(article)
    session.commit()
    return {"ok": True}
