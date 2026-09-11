from fastapi import APIRouter, Query
from app.services.clinvar_service import ClinVarService
from app.schemas.variant_schemas import ClinVarEvidenceResponse

router = APIRouter(prefix="/variants", tags=["Variants"])

@router.get("/evidence", response_model=ClinVarEvidenceResponse)
async def get_variant_evidence(
    gene: str = Query(..., description="Gene symbol, e.g. BRCA1"),
    position: int = Query(..., ge=1, description="CDS coordinate"),
    ref: str = Query(..., max_length=1, description="Reference base"),
    alt: str = Query(..., max_length=1, description="Alternate base"),
    protein: str = Query("", description="Protein change string, e.g. p.Arg1699Trp")
):
    """Retrieve ClinVar and dbSNP evidence for a specific variant."""
    return await ClinVarService.get_variant_evidence(
        gene_symbol=gene,
        position=position,
        ref_base=ref,
        alt_base=alt,
        protein_change=protein
    )
