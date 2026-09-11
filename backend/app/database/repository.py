import json
from sqlalchemy.orm import Session
from app.database.models import GeneCache, SequenceCache, AnalysisHistory, LiteratureCache

class Repository:
    @staticmethod
    def get_cached_gene(db: Session, gene_id: str):
        return db.query(GeneCache).filter(GeneCache.gene_id == str(gene_id)).first()

    @staticmethod
    def save_cached_gene(db: Session, gene_id: str, symbol: str, name: str, organism: str, chromosome: str, summary: str, transcripts: list):
        record = db.query(GeneCache).filter(GeneCache.gene_id == str(gene_id)).first()
        if not record:
            record = GeneCache(
                gene_id=str(gene_id),
                symbol=symbol,
                name=name,
                organism=organism,
                chromosome=chromosome,
                summary=summary,
                transcripts_json=json.dumps(transcripts)
            )
            db.add(record)
        else:
            record.symbol = symbol
            record.name = name
            record.organism = organism
            record.chromosome = chromosome
            record.summary = summary
            record.transcripts_json = json.dumps(transcripts)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_cached_sequence(db: Session, accession: str):
        return db.query(SequenceCache).filter(SequenceCache.accession == accession).first()

    @staticmethod
    def save_cached_sequence(db: Session, accession: str, sequence: str, sequence_type: str, length: int, gc_content: float, description: str = ""):
        record = db.query(SequenceCache).filter(SequenceCache.accession == accession).first()
        if not record:
            record = SequenceCache(
                accession=accession,
                sequence=sequence,
                sequence_type=sequence_type,
                length=length,
                gc_content=gc_content,
                description=description
            )
            db.add(record)
        else:
            record.sequence = sequence
            record.sequence_type = sequence_type
            record.length = length
            record.gc_content = gc_content
            record.description = description
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def save_analysis(db: Session, data: dict):
        record = AnalysisHistory(
            gene_symbol=data.get("gene_symbol"),
            accession=data.get("accession"),
            mutation_type=data.get("mutation_type", "substitution"),
            position=data.get("position"),
            original_base=data.get("original_base"),
            new_base=data.get("new_base"),
            original_codon=data.get("original_codon"),
            modified_codon=data.get("modified_codon"),
            original_aa=data.get("original_aa"),
            modified_aa=data.get("modified_aa"),
            classification=data.get("classification"),
            ml_score=data.get("ml_score"),
            ml_tier=data.get("ml_tier"),
            clinvar_status=data.get("clinvar_status")
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_cached_literature(db: Session, query: str):
        return db.query(LiteratureCache).filter(LiteratureCache.query == query).first()

    @staticmethod
    def save_cached_literature(db: Session, query: str, papers: list, count: int):
        record = db.query(LiteratureCache).filter(LiteratureCache.query == query).first()
        if not record:
            record = LiteratureCache(
                query=query,
                papers_json=json.dumps(papers),
                count=count
            )
            db.add(record)
        else:
            record.papers_json = json.dumps(papers)
            record.count = count
        db.commit()
        db.refresh(record)
        return record
