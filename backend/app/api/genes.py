from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.ncbi_service import NCBIService, FEATURED_GENES
from app.schemas.gene_schemas import GeneSearchResponse, GeneDetailResponse
from app.database.db import get_db
from app.database.repository import Repository

router = APIRouter(prefix="/genes", tags=["Genes"])

@router.get("/featured")
def get_featured_genes():
    """Return pre-indexed research genes for instant 1-click exploration."""
    return [
        {
            "gene_id": g["gene_id"],
            "symbol": g["symbol"],
            "name": g["name"],
            "organism": g["organism"],
            "chromosome": g["chromosome"],
            "summary": g["summary"],
            "primary_accession": g["transcripts"][0]["accession"] if g["transcripts"] else None,
            "benchmark_mutations": g.get("benchmark_mutations", [])
        }
        for g in FEATURED_GENES.values()
    ]

@router.get("/search", response_model=GeneSearchResponse)
async def search_genes(
    q: str = Query(..., min_length=1, description="Gene symbol, name, or Gene ID"),
    organism: str = Query("Homo sapiens", description="Organism filter"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50)
):
    """Dynamically search NCBI Gene database with debounced query."""
    return await NCBIService.search_genes(query=q, organism=organism, page=page, page_size=page_size)

@router.get("/{gene_id}", response_model=GeneDetailResponse)
async def get_gene_details(gene_id: str, db: Session = Depends(get_db)):
    """Retrieve full gene details and available transcripts."""
    cached = Repository.get_cached_gene(db, gene_id)
    if cached:
        import json
        return {
            "gene_id": cached.gene_id,
            "symbol": cached.symbol,
            "name": cached.name,
            "organism": cached.organism,
            "chromosome": cached.chromosome or "N/A",
            "summary": cached.summary or "",
            "transcripts": json.loads(cached.transcripts_json) if cached.transcripts_json else [],
            "primary_cds_accession": json.loads(cached.transcripts_json)[0]["accession"] if cached.transcripts_json else None
        }

    details = await NCBIService.get_gene_details(gene_id)
    if not details:
        raise HTTPException(status_code=404, detail="Gene not found in NCBI.")

    Repository.save_cached_gene(
        db=db,
        gene_id=gene_id,
        symbol=details["symbol"],
        name=details["name"],
        organism=details["organism"],
        chromosome=details.get("chromosome", "N/A"),
        summary=details.get("summary", ""),
        transcripts=details.get("transcripts", [])
    )
    return details
