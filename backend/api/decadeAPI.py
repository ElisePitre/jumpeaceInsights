import sys
import os

sys.path.append(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "ml_training", "scripts")
)

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