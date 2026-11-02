from sqlmodel import SQLModel, Session, create_engine
from app.config import settings

engine = create_engine(settings.database_url, echo=False)


def get_session():
    with Session(engine) as session:
        yield session


def init_db():
    # Untuk starter project ini cukup create_all. Kalau project sudah production
    # dan schema mulai berubah-ubah, ganti ke Alembic untuk migration bertahap
    # (mirip peran "prisma migrate" sebelumnya).
    SQLModel.metadata.create_all(engine)
