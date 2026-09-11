from pydantic import BaseModel
from typing import Optional, List

class TranscriptInfo(BaseModel):
    accession: str
    description: Optional[str] = ""
    cds_length: Optional[int] = 0
    protein_accession: Optional[str] = None

class GeneSearchItem(BaseModel):
    gene_id: str
    symbol: str
    name: str
    organism: str
    chromosome: Optional[str] = "N/A"
    summary: Optional[str] = ""
    aliases: List[str] = []

class GeneSearchResponse(BaseModel):
    query: str
    organism: str
    total_count: int
    page: int
    page_size: int
    results: List[GeneSearchItem]

class GeneDetailResponse(BaseModel):
    gene_id: str
    symbol: str
    name: str
    organism: str
    chromosome: Optional[str] = "N/A"
    summary: Optional[str] = ""
    transcripts: List[TranscriptInfo] = []
    primary_cds_accession: Optional[str] = None
