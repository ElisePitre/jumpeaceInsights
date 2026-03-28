# This file should contain all API functions for the main file to communicate with ML

from cmath import log
import numpy as np
from huggingface_hub import hf_hub_download
from gensim.models import Word2Vec
from symspellpy.symspellpy import SymSpell, Verbosity
import os

sym_spell = SymSpell(max_dictionary_edit_distance=3, prefix_length=5)
DICT_PATH = os.path.join(os.path.dirname(__file__), "en-80k.txt")
sym_spell.create_dictionary(DICT_PATH)

# Known common fixes
OCR_WORD_FIXES = {
    "gnu": "gun",
    "tbe": "the",
    "tlie": "the",
    "tbat": "that",
    "witb": "with",
    "bave": "have",
    "tbere": "there",
    "pple": "apple",
}

# This function should process the start and end times to select/merge models
def selectModels(startDecade, endDecade):
    models = {}
    for curDecade in range(startDecade, endDecade, 10):
        model_path = hf_hub_download(
            repo_id="puneetchdry/w2v_models_jumpeace",
            filename=f"word2vec_{curDecade}s.model",  
        )

        models[f"{curDecade}s"] = model_path

    return models

# This function should load the model from the given path and return the word vectors
def load_model(path):
    try:
        model = Word2Vec.load(path)
        return model.wv
    except Exception as e:
        log.error("Error loading model from %s: %s", path, e)
        return None

# This function should calculate the similarity score between the two words across the selected models
def calculate_weighted_average(term_a, start_year, end_year, models):
    """
    Calculate weighted average cosine similarity between term_a
    and EVERY word in the vocabulary across all decades.

    We compute cosine similarity against the full vocabulary manually.
    """
    term_a = term_a.strip().lower()

    word_decade_data = {}

    for label, path in models.items():

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

    return weighted_results


# This function should submit the query with parameters through the selected model
def query(model, queryWord, destinationWord):
    return {"word": "Data", "value": 0.67}

# HELPER FUNCTION: Calculate cosine similarity between two vectors
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

# Helper function: Checks if a word is considered a garbage word
def is_garbage(word):
    if len(word) <= 2:
        return True

    if not any(c in "aeiou" for c in word):
        return True

    # Check words 5 letters or less to see if they are in the dictionary
    if len(word) <= 5:
        suggestions = sym_spell.lookup(word, Verbosity.TOP, max_edit_distance=0)
        if not suggestions:
            return True
        # Reject words with very low frequency
        if suggestions[0].count < 10000:
            return True

    return False

# Helper function: corrects word based on common fixes, and dictionary check
def correct_word(word):
    word = word.lower().strip()

    if is_garbage(word):
        return None

    # Check common fixes
    if word in OCR_WORD_FIXES:
        corrected = OCR_WORD_FIXES[word]
        print(f"  word-fixed: {word} -> {corrected}")
        return corrected

    if sym_spell.lookup(word, Verbosity.TOP, max_edit_distance=0):
        return word

    # Prefix restoration
    if len(word) <= 4:
        for prefix in "abcdefghijklmnoprstw":
            candidate = prefix + word
            if (
                len(candidate) >= 4
                and len(candidate) > len(word)
                and sym_spell.lookup(candidate, Verbosity.TOP, max_edit_distance=0)
            ):
                print(f"  prefix-restored: {word} -> {candidate}")
                return candidate

    if len(word) <= 5:
        max_dist = 1
    elif len(word) <= 8:
        max_dist = 2
    else:
        max_dist = 3

    corrected = _symspell_lookup(word, max_dist)
    if corrected and corrected != word:
        return corrected

    return word

# Helper function: Returns best suggested fix or none
def _symspell_lookup(word, max_dist):
    max_dist = min(max_dist, 2)
    suggestions = sym_spell.lookup(word, Verbosity.CLOSEST, max_edit_distance=max_dist)
    if suggestions:
        return suggestions[0].term
    return None

# Filters the garbager and merges entries to one word
def merge_corrected_words(results):
    merge_buckets = {}

    for entry in results:
        corrected = correct_word(entry["word"])

        # Remove garbage
        if corrected is None:
            continue

        if corrected not in merge_buckets:
            merge_buckets[corrected] = {
                "word":         corrected,
                "total_score":    entry["weighted_similarity"],
                "count":        1,
                "decades_found": entry["decades_found"]
            }
        else:
            merge_buckets[corrected]["total_score"] += entry["weighted_similarity"]
            merge_buckets[corrected]["count"] += 1
            merge_buckets[corrected]["decades_found"] = max(
                merge_buckets[corrected]["decades_found"],
                entry["decades_found"]
            )

    results_out = []
    for data in merge_buckets.values():
        results_out.append({
            "word": data["word"],
            "weighted_similarity": round(data["total_score"] / data["count"], 4),
            "decades_found": data["decades_found"]
        })

    return results_out