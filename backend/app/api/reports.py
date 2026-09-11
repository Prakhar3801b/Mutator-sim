from fastapi import APIRouter, Body
from app.services.report_service import generate_markdown_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/generate-markdown")
def generate_markdown(payload: dict = Body(...)):
    """Generate markdown-formatted analysis report for download or preview."""
    content = generate_markdown_report(payload)
    return {
        "format": "markdown",
        "content": content
    }
