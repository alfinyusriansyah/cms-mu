import re
import secrets


def slugify(title: str) -> str:
    slug = title.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug


def with_random_suffix(slug: str) -> str:
    suffix = secrets.token_hex(3)
    return f"{slug}-{suffix}"
