"""
decade_comparator.py -- Measure how two terms' association changed over decades. SEMANTIC SHIFT for decades

Plugs directly into your existing pipeline:
  - data_loader.py   : unchanged
  - model_trainer.py : unchanged (models already saved to /models folder)
  - This file        : loads those saved models and compares term pairs

Usage:
    python decade_comparator.py


"""

import os
import numpy as np
import json
import logging
from gensim.models import Word2Vec

log = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────
# This mirrors your OUTPUT_DIR from model_trainer.py
MODELS_DIR = "models"

# Maps decade labels to saved model filenames
# Add or remove decades here as you train more models
#"<XXXX>s": os.path.join(MODELS_DIR, "word2vec_<XXXX>s.model")
DECADE_MODEL_PATHS = {
    "1770s": os.path.join(MODELS_DIR, "word2vec_1770s.model"),
    "1780s": os.path.join(MODELS_DIR, "word2vec_1780s.model"),
    "1790s": os.path.join(MODELS_DIR, "word2vec_1790s.model"),
    "1800s": os.path.join(MODELS_DIR, "word2vec_1800s.model"),
    "1810s": os.path.join(MODELS_DIR, "word2vec_1810s.model"),
    "1820s": os.path.join(MODELS_DIR, "word2vec_1820s.model"),
    "1830s": os.path.join(MODELS_DIR, "word2vec_1830s.model"),
    "1840s": os.path.join(MODELS_DIR, "word2vec_1840s.model"),
    "1850s": os.path.join(MODELS_DIR, "word2vec_1850s.model"),
    "1860s": os.path.join(MODELS_DIR, "word2vec_1860s.model"),
    "1870s": os.path.join(MODELS_DIR, "word2vec_1870s.model"),
    "1880s": os.path.join(MODELS_DIR, "word2vec_1880s.model"),
    "1890s": os.path.join(MODELS_DIR, "word2vec_1890s.model"),
    "1900s": os.path.join(MODELS_DIR, "word2vec_1900s.model"),
    "1910s": os.path.join(MODELS_DIR, "word2vec_1910s.model"),
    "1920s": os.path.join(MODELS_DIR, "word2vec_1920s.model"),
    "1930s": os.path.join(MODELS_DIR, "word2vec_1930s.model"),
    "1940s": os.path.join(MODELS_DIR, "word2vec_1940s.model"),
    "1950s": os.path.join(MODELS_DIR, "word2vec_1950s.model"),
    "1960s": os.path.join(MODELS_DIR, "word2vec_1960s.model"),
}


# ── Core functions ────────────────────────────────────────────────────────

def load_model(path):
    """
    Load a saved Word2Vec model from disk.
    Returns the model's word vectors (wv) object.

    We only need wv -- the KeyedVectors object that maps
    words to their numpy vectors. We don't need the full
    model since we're not training anymore.

    Returns None if the file doesn't exist so callers
    can skip missing decades gracefully.
    """
    if not os.path.exists(path):
        log.warning("Model not found, skipping: %s", path)
        return None

    model = Word2Vec.load(path)
    return model.wv


def cosine_similarity(vec_a, vec_b):
    """
    Measure the angle between two word vectors.

    Returns a float between 0.0 and 1.0.
      1.0 = vectors point same direction = strong association
      0.0 = vectors perpendicular = no association

    This is the same formula used throughout the project.
    Written manually here so you can see exactly what's
    happening rather than hiding it in a library call.
    """
    dot   = np.dot(vec_a, vec_b)
    mag_a = np.linalg.norm(vec_a)
    mag_b = np.linalg.norm(vec_b)

    # guard against zero vectors -- shouldn't happen with
    # trained models but safer to check
    if mag_a == 0 or mag_b == 0:
        return 0.0

    return float(dot / (mag_a * mag_b))


def compare_single_decade(wv, term_a, term_b):
    """
    Given one decade's word vectors and two terms,
    return their cosine similarity.

    Parameters
    ----------
    wv     : KeyedVectors from load_model()
    term_a : e.g. "women"
    term_b : e.g. "work"

    Returns
    -------
    dict with either a similarity score or a descriptive error.

    We return a dict instead of just a float so the caller
    always gets something it can log or send as JSON --
    never a silent None.
    """
    if term_a not in wv:
        return {"error": "'%s' not in this decade's vocabulary" % term_a}
    if term_b not in wv:
        return {"error": "'%s' not in this decade's vocabulary" % term_b}

    vec_a = np.array(wv[term_a])   # shape: (vector_size,) e.g. (200,)
    vec_b = np.array(wv[term_b])   # shape: (vector_size,)

    score = cosine_similarity(vec_a, vec_b)

    return {"similarity": round(score, 4)}


def compare_across_decades(term_a, term_b, start_year=None, end_year=None):
    """
    Main function -- runs compare_single_decade for every
    available trained model and returns results as a list.

    This is what your Flask API will call directly.

    Parameters
    ----------
    term_a     : source word e.g. "women"
    term_b     : destination word e.g. "work"
    start_year : optional int filter e.g. 1850
                 (matches against first 4 chars of decade label)
    end_year   : optional int filter e.g. 1950

    Returns
    -------
    List of dicts, one per decade, ready to JSON-serialize:
    [
      {"decade": "1850s", "similarity": 0.21},
      {"decade": "1860s", "similarity": 0.23},
      {"decade": "1870s", "similarity": None, "note": "'work' not in vocabulary"},
      ...
    ]

    Decades where the model file doesn't exist are silently skipped.
    Decades where a term is missing get similarity: None with a note.
    """
    term_a = term_a.strip().lower()
    term_b = term_b.strip().lower()

    results = []

    for label, path in DECADE_MODEL_PATHS.items():

        # apply date range filter if provided
        decade_year = int(label[:4])   # "1850s" -> 1850
        if start_year and decade_year < start_year:
            continue
        if end_year   and decade_year > end_year:
            continue

        wv = load_model(path)
        if wv is None:
            continue   # model file not trained yet, skip silently

        result = compare_single_decade(wv, term_a, term_b)

        if "similarity" in result:
            results.append({
                "decade"     : label,
                "similarity" : result["similarity"]
            })
        else:
            # word was missing -- still include the decade so the
            # frontend knows there's a gap, just with null similarity
            results.append({
                "decade"     : label,
                "similarity" : None,
                "note"       : result["error"]
            })

        log.info("  %s | %s <-> %s | %s",
                 label, term_a, term_b,
                 "%.4f" % result["similarity"]
                 if "similarity" in result
                 else result["error"])

    return results


def save_comparison(term_a, term_b, results, output_path="results.json"):
    """
    Save compare_across_decades output to a JSON file.

    Useful for testing without running Flask --
    you can inspect the file directly or load it in React
    as a static fixture while the API is being wired up.
    """
    output = {
        "term_a"  : term_a,
        "term_b"  : term_b,
        "results" : results
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print("Saved to %s" % output_path)


# ── Entry point -- run directly to test ───────────────────────────────────

if __name__ == "__main__":

    logging.basicConfig(
        level  = logging.INFO,
        format = "%(asctime)s [%(levelname)s] %(message)s"
    )


##FOR TESTING PAIRS

    TERM_A     = "women"
    TERM_B     = "work"
    START_YEAR = 1850
    END_YEAR   = 1960

    print("=" * 55)
    print("Comparing: '%s' <-> '%s'  (%d-%d)"
          % (TERM_A, TERM_B, START_YEAR, END_YEAR))
    print("=" * 55)

    results = compare_across_decades(TERM_A, TERM_B, START_YEAR, END_YEAR)

    # Print summary table
    print("\n%-10s  %-12s  %s" % ("Decade", "Similarity", "Visual"))
    print("-" * 45)
    for row in results:
        if row["similarity"] is not None:
            bar = "█" * int(row["similarity"] * 30)
            print("%-10s  %-12.4f  %s" % (row["decade"], row["similarity"], bar))
        else:
            print("%-10s  %-12s  %s" % (row["decade"], "n/a", row.get("note", "")))

    # Save for React to use as a static fixture while API is being built
    save_comparison(TERM_A, TERM_B, results, "results.json")
