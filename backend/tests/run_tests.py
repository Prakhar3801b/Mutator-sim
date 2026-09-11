import sys
import os

# Add backend directory to path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, backend_dir)

from app.bio.mutation_engine import simulate_mutation, MutationValidationError
from app.ml.features import get_grantham_distance, get_blosum62_score, extract_ml_features
from app.ml.model import predict_variant_impact

def run_all_tests():
    print("Running Backend Verification Tests...")
    
    # Test 1: Synonymous
    seq = "ATGCCAGAA"
    res1 = simulate_mutation(seq, position=9, original_base="A", new_base="G")
    assert res1["classification"] == "synonymous", f"Expected synonymous, got {res1['classification']}"
    print("PASS: test_synonymous_mutation")

    # Test 2: Missense
    res2 = simulate_mutation(seq, position=8, original_base="A", new_base="T")
    assert res2["classification"] == "missense", f"Expected missense, got {res2['classification']}"
    assert res2["amino_acid"]["original_aa_code"] == "E"
    assert res2["amino_acid"]["modified_aa_code"] == "V"
    print("PASS: test_missense_mutation")

    # Test 3: Nonsense
    res3 = simulate_mutation(seq, position=7, original_base="G", new_base="T")
    assert res3["classification"] == "nonsense", f"Expected nonsense, got {res3['classification']}"
    assert res3["amino_acid"]["is_premature_stop"] is True
    print("PASS: test_nonsense_mutation")

    # Test 4: Validation bounds
    try:
        simulate_mutation(seq, position=100, original_base="A", new_base="T")
        assert False, "Should have raised MutationValidationError"
    except MutationValidationError:
        print("PASS: test_validation_bounds")

    # Test 5: Grantham & BLOSUM
    g = get_grantham_distance('E', 'V')
    assert g == 121.0
    b = get_blosum62_score('E', 'V')
    assert b == -2.0
    print("PASS: test_grantham_and_blosum")

    # Test 6: ML Prediction
    pred_syn = predict_variant_impact(orig_aa="R", mod_aa="R")
    assert pred_syn["risk_tier"] == "Benign / Tolerated"
    print("PASS: test_prediction_synonymous")

    pred_rad = predict_variant_impact(
        orig_aa="R",
        mod_aa="W",
        codon_position=1,
        relative_position=0.7,
        local_gc_content=52.0,
        is_transition=False
    )
    assert pred_rad["pathogenic_probability"] > 0.4
    print("PASS: test_prediction_radical")

    print("\nALL 6 BACKEND TEST SUITES PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_all_tests()
