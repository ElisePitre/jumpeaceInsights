# This file should contain all API functions for the main file to communicate with ML

import logging
import numpy as np
from huggingface_hub import hf_hub_download
from gensim.models import Word2Vec

log = logging.getLogger(__name__)

# This function should process the start and end times to select/merge models
def selectModels(startDecade, endDecade):
    models = {}
    EARLIEST_DECADE = 1790
    LATEST_DECADE = 1960

    startDecade = max(EARLIEST_DECADE, startDecade)
    endDecade = min(LATEST_DECADE, endDecade)

    for curDecade in range(startDecade, endDecade + 1, 10):
        try:
            model_path = hf_hub_download(
                repo_id="puneetchdry/w2v_models_jumpeace",
                filename=f"word2vec_{curDecade}s.model",
            )
            try:
                hf_hub_download(
                    repo_id="puneetchdry/w2v_models_jumpeace",
                    filename=f"word2vec_{curDecade}s.model.syn1neg.npy",
                )
                hf_hub_download(
                    repo_id="puneetchdry/w2v_models_jumpeace",
                    filename=f"word2vec_{curDecade}s.model.wv.vectors.npy",
                )
            except Exception:
                pass  # companion files missing, Gensim will handle it
            models[f"{curDecade}s"] = model_path
        except Exception as e:
            log.warning("Model not found for %ss: %s", curDecade, e)
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