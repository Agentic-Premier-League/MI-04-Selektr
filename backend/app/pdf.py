from io import BytesIO

import pdfplumber


def extract_pdf_text(file_bytes: bytes) -> str:
    text_parts: list[str] = []
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                text_parts.append(page_text)
    return "\n\n".join(text_parts).strip()
