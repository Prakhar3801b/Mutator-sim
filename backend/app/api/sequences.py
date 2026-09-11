from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.ncbi_service import NCBIService
from app.database.db import get_db
from app.database.repository import Repository

router = APIRouter(prefix="/sequences", tags=["Sequences"])

@router.get("/{accession}")
async def get_sequence(accession: str, db: Session = Depends(get_db)):
    """Retrieve coding sequence for an accession from cache or NCBI."""
    cached = Repository.get_cached_sequence(db, accession)
    if cached:
        return {
            "accession": cached.accession,
            "sequence": cached.sequence,
            "sequence_type": cached.sequence_type,
            "length": cached.length,
            "gc_content": cached.gc_content,
            "description": cached.description
        }

    seq_data = await NCBIService.fetch_sequence(accession)
    if not seq_data:
        raise HTTPException(status_code=404, detail="Sequence not found for accession.")

    Repository.save_cached_sequence(
        db=db,
        accession=accession,
        sequence=seq_data["sequence"],
        sequence_type=seq_data.get("sequence_type", "CDS"),
        length=seq_data["length"],
        gc_content=seq_data["gc_content"],
        description=seq_data.get("description", "")
    )
    return seq_data
