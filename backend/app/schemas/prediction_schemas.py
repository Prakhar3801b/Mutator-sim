from pydantic import BaseModel
from typing import Optional, List, Dict

class PredictionRequest(BaseModel):
    original_aa: str  # 1-letter code, e.g. "R"
    modified_aa: str  # 1-letter code, e.g. "W"
    codon_position: int = 1  # 1, 2, or 3
    original_codon: str
    modified_codon: str
    relative_position: float = 0.5  # 0.0 - 1.0 along protein
    local_gc_content: float = 50.0  # %
    is_transition: bool = True
    gene_symbol: Optional[str] = None

class FeatureContribution(BaseModel):
    feature_name: str
    feature_label: str
    value: float
    contribution: float  # -1.0 to 1.0 direction/magnitude
    interpretation: str

class PredictionResponse(BaseModel):
    model_name: str
    pathogenic_probability: float  # 0.0 - 1.0
    risk_tier: str  # Benign, Likely Benign, Uncertain, Likely Damaging, Pathogenic
    risk_color: str  # HEX color token
    confidence_level: str  # Low, Moderate, High
    feature_contributions: List[FeatureContribution]
    raw_features: Dict[str, float]
    scientific_disclaimer: str

class PubMedArticle(BaseModel):
    pmid: str
    title: str
    authors: str
    journal: str
    year: str
    doi: Optional[str] = None
    url: str
    abstract: Optional[str] = ""

class LiteratureResponse(BaseModel):
    query: str
    gene_symbol: str
    total_results: int
    articles: List[PubMedArticle]
    publication_trend: Dict[str, int]  # Year -> count
