import sys
import os

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..")
)

ML_SCRIPTS_PATH = os.path.join(BASE_DIR, "ml_training", "scripts")

sys.path.append(ML_SCRIPTS_PATH)

from decade_comparator import compare_across_decades

def selectModel(startYear, endYear):
    return {
        "start_year": int(startYear) if startYear else None,
        "end_year":   int(endYear)   if endYear   else None
    }

def query(model_config, queryWord, destinationWord):
    return compare_across_decades(
        term_a     = queryWord,
        term_b     = destinationWord,
        start_year = model_config["start_year"],
        end_year   = model_config["end_year"]
    )