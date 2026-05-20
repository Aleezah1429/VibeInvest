import logging
# pyrefly: ignore [missing-import]
from pypdf import PdfReader

log = logging.getLogger("pdf_parser")

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts text from each page of a PDF file using pypdf."""
    try:
        reader = PdfReader(file_path)
        text_list = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                text_list.append(f"--- Pitch Deck Page {i+1} ---\n{text.strip()}")
        extracted = "\n\n".join(text_list)
        log.info("Successfully extracted %d characters from PDF %s", len(extracted), file_path)
        return extracted
    except Exception as e:
        log.error("Failed to parse PDF %s: %s", file_path, e)
        return ""
