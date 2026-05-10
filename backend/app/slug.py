import re
import secrets


def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text).strip("-")
    return text or "job"


def make_unique_slug(title: str) -> str:
    return f"{slugify(title)}-{secrets.token_hex(2)}"
