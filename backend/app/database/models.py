import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from app.database.db import Base

class GeneCache(Base):
    __tablename__ = "gene_cache"
    
    gene_id = Column(String(50), primary_key=True, index=True)
    symbol = Column(String(50), index=True)
    name = Column(String(255))
    organism = Column(String(100), index=True)
    chromosome = Column(String(20), nullable=True)
    summary = Column(Text, nullable=True)
    transcripts_json = Column(Text, nullable=True)  # JSON-serialized list of transcripts
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class SequenceCache(Base):
    __tablename__ = "sequence_cache"
    
    accession = Column(String(100), primary_key=True, index=True)
    sequence = Column(Text, nullable=False)
    sequence_type = Column(String(50), default="CDS")
    length = Column(Integer)
    gc_content = Column(Float)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    gene_symbol = Column(String(50), index=True)
    accession = Column(String(100))
    mutation_type = Column(String(30), default="substitution")
    position = Column(Integer, nullable=False)
    original_base = Column(String(10), nullable=False)
    new_base = Column(String(10), nullable=False)
    original_codon = Column(String(10))
    modified_codon = Column(String(10))
    original_aa = Column(String(20))
    modified_aa = Column(String(20))
    classification = Column(String(50))
    ml_score = Column(Float, nullable=True)
    ml_tier = Column(String(50), nullable=True)
    clinvar_status = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class LiteratureCache(Base):
    __tablename__ = "literature_cache"
    
    query = Column(String(255), primary_key=True, index=True)
    papers_json = Column(Text, nullable=False)
    count = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
