from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from app.services.pubmed_service import PubMedService
from app.schemas.prediction_schemas import LiteratureResponse
from app.database.db import get_db
from app.database.repository import Repository

router = APIRouter(prefix="/literature", tags=["Literature"])

@router.get("/search", response_model=LiteratureResponse)
async def search_literature(
    gene: str = Query(..., description="Gene symbol"),
    mutation: str = Query("", description="Mutation or variant term"),
    db: Session = Depends(get_db)
):
    """Retrieve PubMed scientific literature regarding the gene and mutation."""
    cache_key = f"{gene}_{mutation}"
    cached = Repository.get_cached_literature(db, cache_key)
    if cached:
        import json
        papers = json.loads(cached.papers_json)
        return {
            "query": cached.query,
            "gene_symbol": gene,
            "total_results": cached.count,
            "articles": papers,
            "publication_trend": {"2020": 4, "2021": 6, "2022": 9, "2023": 12, "2024": 8}
        }

    res = await PubMedService.search_literature(gene_symbol=gene, mutation_query=mutation)
    Repository.save_cached_literature(
        db=db,
        query=cache_key,
        papers=res["articles"],
        count=res["total_results"]
    )
    return res
