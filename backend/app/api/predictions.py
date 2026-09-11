from fastapi import APIRouter
from app.schemas.prediction_schemas import PredictionRequest, PredictionResponse
from app.ml.model import predict_variant_impact

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.post("/impact", response_model=PredictionResponse)
def predict_impact(req: PredictionRequest):
    """
    Run Scikit-learn variant impact prediction model and return
    pathogenic probability, risk tier, and explainable feature contributions.
    """
    return predict_variant_impact(
        orig_aa=req.original_aa,
        mod_aa=req.modified_aa,
        codon_position=req.codon_position,
        relative_position=req.relative_position,
        local_gc_content=req.local_gc_content,
        is_transition=req.is_transition
    )
