from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routers import articles, auth, upload

app = FastAPI(title="Next CMS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Menyajikan file yang diupload, misal: GET /static/uploads/xxx.jpg
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(articles.router)
app.include_router(upload.router)


@app.on_event("startup")
def on_startup():
    # Untuk starter project: langsung create_all dari model.
    # Untuk production, pertimbangkan Alembic supaya schema migration terekam.
    init_db()


@app.get("/")
def health_check():
    return {"status": "ok"}
