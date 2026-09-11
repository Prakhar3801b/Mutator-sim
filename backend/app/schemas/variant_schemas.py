from pydantic import BaseModel
from typing import Optional, List

class ClinVarVariation(BaseModel):
    variation_id: str
    title: str
    clinical_significance: str  # Pathogenic, Benign, Uncertain significance, etc.
    review_status: Optional[str] = "criteria provided, single submitter"
    last_evaluated: Optional[str] = None
    allele_id: Optional[str] = None
    rs_id: Optional[str] = None
    hgvs_c: Optional[str] = None
    hgvs_p: Optional[str] = None
    condition: Optional[str] = None

class ClinVarEvidenceResponse(BaseModel):
    gene_symbol: str
    query_term: str
    status: str  # "exact_match", "related_variant", "no_record_found"
    status_label: str
    disclaimer: str
    exact_matches: List[ClinVarVariation] = []
    related_variants: List[ClinVarVariation] = []
    total_found: int = 0
