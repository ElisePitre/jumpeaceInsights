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
from huggingface_hub import hf_hub_download

log = logging.getLogger(__name__)

DECADE_LABELS = [
    "1770s", "1780s", "1790s", "1800s", "1810s", "1820s", "1830s",
    "1840s", "1850s", "1860s", "1870s", "1880s", "1890s", "1900s",
    "1910s", "1920s", "1930s", "1940s", "1950s", "1960s",
]


# ── Core functions ────────

def load_model(decade_label):
    """
    Load a Word2Vec model from HuggingFace Hub.
    Returns the model's word vectors (wv) object.

    Returns None if the model doesn't exist on the Hub so callers
    can skip missing decades gracefully.
    """

    try:
        model_path = hf_hub_download(
            repo_id="puneetchdry/w2v_models_jumpeace",
            filename=f"word2vec_{decade_label}.model",
        )
        try:
            hf_hub_download(
                repo_id="puneetchdry/w2v_models_jumpeace",
                filename=f"word2vec_{decade_label}.model.syn1neg.npy",
            )
            hf_hub_download(
                repo_id="puneetchdry/w2v_models_jumpeace",
                filename=f"word2vec_{decade_label}.model.wv.vectors.npy",
            )
        except Exception:
            pass  # companion files missing, skip (1830s below doesnt have companion files, but still loads fine)
        model = Word2Vec.load(model_path)
        return model.wv
    except Exception as e:
        log.warning("Model not found for %s: %s", decade_label, e)
        return None


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

    # 0 vectors can cause division by zero, 
    # so we return 0 similarity in that case
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

    vec_a = np.array(wv[term_a])
    vec_b = np.array(wv[term_b])

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
    """
    term_a = term_a.strip().lower()
    term_b = term_b.strip().lower()

    results = []

    for label in DECADE_LABELS:

        decade_year = int(label[:4])
        if start_year and decade_year < start_year:
            continue
        if end_year and decade_year > end_year:
            continue

        wv = load_model(label)
        if wv is None:
            continue

        result = compare_single_decade(wv, term_a, term_b)

        if "similarity" in result:
            results.append({
                "decade"     : label,
                "similarity" : result["similarity"]
            })
        else:
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
    in that decade's vocabulary.

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

    weighted_pairs = []

    for row in results:
        if row["similarity"] is None:
            continue

        label = row["decade"]

        wv = load_model(label)
        if wv is None:
            continue

        try:
            count = wv.get_vecattr(term_a, "count")
        except KeyError:
            count = 1

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
    """
    output = {
        "term_a"  : term_a,
        "term_b"  : term_b,
        "results" : results
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print("Saved to %s" % output_path)


def save_search_results(term_a, weighted_results, output_path="search-results.json"):
    """
    Save weighted word search results to a JSON file.
    """
    vectors = [
        {"word": row["word"], "vector": round(row["weighted_similarity"], 2)}
        for row in weighted_results
    ]

    output = {
        "results": {
            "search": term_a,
            "vectors": vectors
        }
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print("Saved search results to %s" % output_path)


def get_weighted_top_words(term_a, start_year, end_year, topn=50):
    """
    Get the top N most associated words to term_a, weighted by
    word count across all decades in the given range.
    """
    term_a = term_a.strip().lower()

    word_decade_data = {}

    for label in DECADE_LABELS:

        decade_year = int(label[:4])
        if start_year and decade_year < start_year:
            continue
        if end_year and decade_year > end_year:
            continue

        wv = load_model(label)
        if wv is None:
            continue

        if term_a not in wv:
            log.info("  %s: '%s' not in vocabulary -- skipping", label, term_a)
            continue

        similar = wv.most_similar(term_a, topn=topn)

        try:
            term_a_count = wv.get_vecattr(term_a, "count")
        except KeyError:
            term_a_count = 1

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

    weighted_results.sort(key=lambda x: x["weighted_similarity"], reverse=True)
    return weighted_results[:topn]


def get_weighted_all_words(term_a, start_year, end_year):
    """
    Calculate weighted average cosine similarity between term_a
    and EVERY word in the vocabulary across all decades.
    """
    term_a = term_a.strip().lower()

    word_decade_data = {}

    for label in DECADE_LABELS:

        decade_year = int(label[:4])
        if start_year and decade_year < start_year:
            continue
        if end_year and decade_year > end_year:
            continue

        wv = load_model(label)
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

        for word in wv.key_to_index:

            if word == term_a:
                continue

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


# ENTRY POINT FOR RUNNING PROGRAM. Modify TERM_A, TERM_B, START_YEAR, END_YEAR below.
if __name__ == "__main__":

    logging.basicConfig(
        level  = logging.INFO,
        format = "%(asctime)s [%(levelname)s] %(message)s"
    )
    logging.getLogger("gensim").setLevel(logging.ERROR)
    logging.getLogger(__name__).setLevel(logging.ERROR)

## testing weighted average
    TERM_A     = "women"
    START_YEAR = 1770
    END_YEAR   = 1790

    num_loaded_decades = 0
    for label in DECADE_LABELS:
        decade_year = int(label[:4])
        if decade_year < START_YEAR or decade_year > END_YEAR:
            continue
        wv = load_model(label)
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

    filtered = [r for r in results
                if r["decades_found"] >= num_loaded_decades
                and r["weighted_similarity"] >= 0.75]
    save_search_results(TERM_A, filtered, "search-results.json")


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

    print("\n%-10s  %-12s  %s" % ("Decade", "Similarity", "Visual"))
    print("-" * 45)
    for row in results:
        if row["similarity"] is not None:
            bar = "█" * int(row["similarity"] * 30)
            print("%-10s  %-12.4f  %s" % (row["decade"], row["similarity"], bar))
        else:
            print("%-10s  %-12s  %s" % (row["decade"], "n/a", row.get("note", "")))

    save_comparison(TERM_A, TERM_B, results, "results.json")

    weighted_avg = calculate_weighted_average(TERM_A, TERM_B, START_YEAR, END_YEAR, results)
    print("\nWeighted Average Similarity: %s" % (
        "%.4f" % weighted_avg if weighted_avg is not None else "n/a"
    ))

    print("\n--- Calculation Breakdown ---")
    pairs = []
    for row in results:
        if row["similarity"] is None:
            continue
        wv = load_model(row["decade"])
        if wv is None:
            continue
        try:
            count = wv.get_vecattr(TERM_A.strip().lower(), "count")
        except KeyError:
            count = 1
        pairs.append((row["decade"], row["similarity"], count))

    total_count = sum(c for _, _, c in pairs)
    print("Total count of '%s' across decades: %d\n" % (TERM_A, total_count))
    print("%-10s  %-10s  %-12s  %-10s  %s" % (
        "Decade", "Count", "Pct", "Cosine", "Contribution"))
    print("-" * 60)
    for label, sim, count in pairs:
        pct = count / total_count
        contrib = pct * sim
        print("%-10s  %-10d  %-12.2f%%  %-10.4f  %.4f" % (
            label, count, pct * 100, sim, contrib))
    print("-" * 60)
    print("Sum of contributions = %.4f" % weighted_avg)
