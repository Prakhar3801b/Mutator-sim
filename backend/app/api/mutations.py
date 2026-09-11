from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.mutation_schemas import MutationSimulateRequest, MutationSimulateResponse
from app.bio.mutation_engine import simulate_mutation, MutationValidationError
from app.database.db import get_db
from app.database.repository import Repository

router = APIRouter(prefix="/mutations", tags=["Mutations"])

@router.post("/simulate", response_model=MutationSimulateResponse)
def simulate(req: MutationSimulateRequest, db: Session = Depends(get_db)):
    """
    Simulate a mutation on a DNA/CDS sequence and trace effects through
    DNA -> Codon -> Amino Acid -> Protein Classification.
    """
    try:
        result = simulate_mutation(
            sequence=req.sequence,
            position=req.position,
            original_base=req.original_base,
            new_base=req.new_base,
            mutation_type=req.mutation_type
        )
        
        # Log to analysis history
        Repository.save_analysis(db, {
            "gene_symbol": req.gene_symbol or "UNKNOWN",
            "accession": req.accession or "UNKNOWN",
            "mutation_type": req.mutation_type,
            "position": req.position,
            "original_base": req.original_base,
            "new_base": req.new_base,
            "original_codon": result["codon"]["original_codon"],
            "modified_codon": result["codon"]["modified_codon"],
            "original_aa": result["amino_acid"]["original_aa_code"],
            "modified_aa": result["amino_acid"]["modified_aa_code"],
            "classification": result["classification"],
            "ml_score": None,
            "ml_tier": None,
            "clinvar_status": None
        })
        
        return result
    except MutationValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")
