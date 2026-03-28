"""
decade_comparator.py -- Measure how two terms' association changed over decades. SEMANTIC SHIFT for decades

Usage:
    python decade_comparator.py

    Bottom lines in Main, substitite term A or B and Start and End Year to maange


"""

import os
import numpy as np
import json
import logging
from gensim.models import Word2Vec

log = logging.getLogger(__name__)

#  Config
MODELS_DIR = MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "w2v_models")

# Maps decade labels to saved model filenames
# Add or remove decades here as you train more models
#"<XXXX>s": os.path.join(MODELS_DIR, "word2vec_<XXXX>s.model")
DECADE_MODEL_PATHS = {
    "1770s": os.path.join(MODELS_DIR, "word2vec_1770s.model"),
    "1780s": os.path.join(MODELS_DIR, "word2vec_1780s.model"), #MARK this isnt trained
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


# ── Core functions ────────

def load_model(path):
    """
    Load a saved Word2Vec model from disk.
    Returns the model's word vectors (wv) object.

    We only need wv for mapping of the KeyedVectors object that maps
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

    Parameters:

    wv     : KeyedVectors from load_model()
    term_a : e.g. "women"
    term_b : e.g. "work"

    Returns:

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
            continue   # model file not trained, skip for now

        result = compare_single_decade(wv, term_a, term_b)

        if "similarity" in result:
            results.append({
                "decade"     : label,
                "similarity" : result["similarity"]
            })
        else:
            # if word was missing -- still include the decade so the
            # frontend included gap in dummy values for erro checkl
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

def calculate_weighted_average(term_a, term_b, start_year, end_year, results):
    """
    Calculate a single weighted average similarity score across decades.

    Each decade's cosine similarity is weighted by the count of term_a
    in that decade's vocabulary.  Decades where the word appears more
    often contribute proportionally more to the final score.

    Formula:
        weighted_avg = Σ (count_i / total_count) * similarity_i

    Parameters
    ----------
    term_a     : str – source word
    term_b     : str – target word
    start_year : int – inclusive lower bound
    end_year   : int – inclusive upper bound
    results    : list[dict] – output from compare_across_decades()

    Returns
    -------
    float or None
    """
    term_a = term_a.strip().lower()

    # Collect (similarity, count) pairs for each decade that has a valid score
    weighted_pairs = []

    for row in results:
        if row["similarity"] is None:
            continue

        label = row["decade"]
        decade_year = int(label[:4])

        # load the model to grab the word count
        path = DECADE_MODEL_PATHS.get(label)
        if path is None:
            continue

        wv = load_model(path)
        if wv is None:
            continue

        try:
            count = wv.get_vecattr(term_a, "count")
        except KeyError:
            count = 1  # fallback if count unavailable

        weighted_pairs.append((row["similarity"], count))

    if not weighted_pairs:
        return None

    total_count = sum(count for _, count in weighted_pairs)

    weighted_avg = sum(
        (count / total_count) * sim
        for sim, count in weighted_pairs
    )

    return round(weighted_avg, 4)

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

def get_weighted_top_words(term_a, start_year, end_year, topn=50):
    """
    Get the top N most associated words to term_a, weighted by
    word count across all decades in the given range.

    Parameters
    ----------
    term_a     : source word e.g. "war"
    start_year : int e.g. 1800
    end_year   : int e.g. 1900
    topn       : number of top words to return (default 50)

    Returns
    -------
    List of dicts sorted by weighted similarity descending:
    [
      {"word": "freedom", "weighted_similarity": 0.87, "decades_found": 4},
      {"word": "liberty", "weighted_similarity": 0.81, "decades_found": 6},
      ...
    ]
    """
    term_a = term_a.strip().lower()

    # { "freedom": [{"cosine": 0.87, "count": 4200}, ...], ... }
    word_decade_data = {}

    for label, path in DECADE_MODEL_PATHS.items():

        decade_year = int(label[:4])
        if start_year and decade_year < start_year:
            continue
        if end_year and decade_year > end_year:
            continue

        wv = load_model(path)
        if wv is None:
            continue

        if term_a not in wv:
            log.info("  %s: '%s' not in vocabulary -- skipping", label, term_a)
            continue

        # get top N similar words for this decade
        similar = wv.most_similar(term_a, topn=topn)

        # get the count for term_a in this decade as the weight
        try:
            term_a_count = wv.get_vecattr(term_a, "count")
        except KeyError:
            term_a_count = 1  # fallback if count unavailable

        for word, cosine in similar:
            if word not in word_decade_data:
                word_decade_data[word] = []

            word_decade_data[word].append({
                "decade": label,
                "cosine": cosine,
                "count":  term_a_count
            })

    if not word_decade_data:
        return []

    # calculate weighted average per word
    weighted_results = []

    for word, decade_entries in word_decade_data.items():

        total_count = sum(d["count"] for d in decade_entries)

        weighted_sim = sum(
            (d["count"] / total_count) * d["cosine"]
            for d in decade_entries
        )

        weighted_results.append({
            "word":                word,
            "weighted_similarity": round(weighted_sim, 4),
            "decades_found":       len(decade_entries)
        })

    # sort by weighted similarity descending, return top N
    weighted_results.sort(key=lambda x: x["weighted_similarity"], reverse=True)
    return weighted_results[:topn]

def get_weighted_all_words(term_a, start_year, end_year):
    """
    Calculate weighted average cosine similarity between term_a
    and EVERY word in the vocabulary across all decades.

    Instead of most_similar(topn=50), we compute cosine similarity
    against the full vocabulary manually.
    """
    term_a = term_a.strip().lower()

    word_decade_data = {}

    for label, path in DECADE_MODEL_PATHS.items():

        decade_year = int(label[:4])
        if start_year and decade_year < start_year:
            continue
        if end_year and decade_year > end_year:
            continue

        wv = load_model(path)
        if wv is None:
            continue

        if term_a not in wv:
            log.info("  %s: '%s' not in vocabulary -- skipping", label, term_a)
            continue

        vec_a = np.array(wv[term_a])

        try:
            term_a_count = wv.get_vecattr(term_a, "count")
        except KeyError:
            term_a_count = 1

        # iterate over every word in this decade's vocabulary
        for word in wv.key_to_index:

            if word == term_a:
                continue  # skip self

            vec_b  = np.array(wv[word])
            cosine = cosine_similarity(vec_a, vec_b)

            if word not in word_decade_data:
                word_decade_data[word] = []

            word_decade_data[word].append({
                "decade": label,
                "cosine": cosine,
                "count":  term_a_count
            })

    if not word_decade_data:
        return []

    # weighted average per word
    weighted_results = []

    for word, decade_entries in word_decade_data.items():

        total_count  = sum(d["count"] for d in decade_entries)
        weighted_sim = sum(
            (d["count"] / total_count) * d["cosine"]
            for d in decade_entries
        )

        weighted_results.append({
            "word":                word,
            "weighted_similarity": round(weighted_sim, 4),
            "decades_found":       len(decade_entries)
        })

    weighted_results.sort(key=lambda x: x["weighted_similarity"], reverse=True)
    return weighted_results


# ENTRY POINT FOR RUNNING PROGRAM. Modify under "FOR TESTING PAIRS, Change TERM_B,TEAM_A AND START_yEAR AND END_YEAR
if __name__ == "__main__":

    logging.basicConfig(
        level  = logging.INFO,
        format = "%(asctime)s [%(levelname)s] %(message)s"
    )
    # suppress gensim's verbose model-loading logs and our own warnings
    logging.getLogger("gensim").setLevel(logging.ERROR)
    logging.getLogger(__name__).setLevel(logging.ERROR)

## testing weighted average
    TERM_A     = "women"
    START_YEAR = 1770
    END_YEAR   = 1790

    # count how many decades actually loaded
    num_loaded_decades = 0
    for label, path in DECADE_MODEL_PATHS.items():
        decade_year = int(label[:4])
        if decade_year < START_YEAR or decade_year > END_YEAR:
            continue
        wv = load_model(path)
        if wv is None:
            continue
        num_loaded_decades += 1
        print(f"{label}: '{TERM_A}' in vocab = {TERM_A in wv}")

    print(f"\nLoaded decades: {num_loaded_decades}")
    print("Only showing words found in ALL %d decades.\n" % num_loaded_decades)

    results = get_weighted_all_words(TERM_A, START_YEAR, END_YEAR)

    print("%-20s  %-22s  %s" % ("Word", "Weighted Similarity", "Decades Found"))
    print("-" * 55)
    for row in results:
        if row["decades_found"] < num_loaded_decades:
            continue
        if row["weighted_similarity"] < 0.75:
            continue
        print("%-20s  %-22.4f  %d" % (
            row["word"],
            row["weighted_similarity"],
            row["decades_found"]
        ))



##FOR TESTING PAIRS

    TERM_A     = "war"
    TERM_B     = "immediate"
    START_YEAR = 1770
    END_YEAR   = 1800

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
