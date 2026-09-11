from app.ml.features import get_grantham_distance, get_blosum62_score, extract_ml_features
from app.ml.model import predict_variant_impact

def test_grantham_and_blosum():
    # E -> V (Grantham: 121, BLOSUM62: -2)
    g = get_grantham_distance('E', 'V')
    assert g == 121.0
    b = get_blosum62_score('E', 'V')
    assert b == -2.0

    # Identical residue
    assert get_grantham_distance('A', 'A') == 0.0
    assert get_blosum62_score('A', 'A') == 4.0

def test_feature_extraction():
    feats = extract_ml_features(
        orig_aa="E",
        mod_aa="V",
        codon_position=2,
        relative_position=0.25,
        local_gc_content=45.0,
        is_transition=False
    )
    assert feats["grantham_distance"] == 121.0
    assert feats["blosum62_score"] == -2.0
    assert feats["codon_position"] == 2.0
    assert feats["is_transition"] == 0.0

def test_prediction_synonymous():
    res = predict_variant_impact(orig_aa="R", mod_aa="R")
    assert res["risk_tier"] == "Benign / Tolerated"
    assert res["pathogenic_probability"] < 0.1

def test_prediction_radical():
    res = predict_variant_impact(
        orig_aa="R",
        mod_aa="W",
        codon_position=1,
        relative_position=0.7,
        local_gc_content=52.0,
        is_transition=False
    )
    assert res["pathogenic_probability"] > 0.5
    assert len(res["feature_contributions"]) > 0
