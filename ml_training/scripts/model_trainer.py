"""
=============================================================
 model_trainer.py  -- Build, train, save model
=============================================================

FIXES IN THIS VERSION:
  
"""

import os
import logging
from gensim.models import Word2Vec

log = logging.getLogger(__name__)

# ── Hyperparameters ───────────────────────────────────────────────────────
VECTOR_SIZE = 200   # number of dimensions per word vector
WINDOW      = 5     # context window (words either side of target)
MIN_COUNT   = 5     # ignore words appearing fewer than this many times
WORKERS     = 4     # CPU threads -- set to your core count
SG          = 1     # 1 = skip-gram (better for rare/historical words)
                    # 0 = CBOW      (faster, works well with lots of data)
EPOCHS      = 5     # training passes over the data

OUTPUT_DIR  = "../w2v_models"


def build_model() -> Word2Vec:
    """
    STEP 2 -- Create an untrained Word2Vec model shell.

    We create the model without data here so the same settings
    can be reused cleanly for every decade.
    """
    log.info("[STEP 2] Building Word2Vec model...")

    model = Word2Vec(
        vector_size = VECTOR_SIZE,
        window      = WINDOW,
        min_count   = MIN_COUNT,
        workers     = WORKERS,
        sg          = SG,
        epochs      = EPOCHS,
    )

    log.info("  Settings: vector_size=%d, window=%d, min_count=%d, "
             "algorithm=%s, epochs=%d",
             VECTOR_SIZE, WINDOW, MIN_COUNT,
             "skip-gram" if SG else "CBOW", EPOCHS)
    log.info("[STEP 2] Model ready.\n")
    return model


def train_and_save(model: Word2Vec, sentences: list, decade_start: int):
    """
    STEP 3 -- Train the model on sentences, then save to disk.

    Two sub-steps:
      3a. build_vocab()  -- scans sentences to build the word list.
                            Must happen before training.
      3b. train()        -- does the gradient-descent learning.

    Parameters
    ----------
    model         : untrained Word2Vec from build_model()
    sentences     : tokenised articles from load_decade()
    decade_start  : e.g. 1850 (used to name the output file)

    Returns
    -------
    Path to the saved .model file, or None if no data.
    """
    if not sentences:
        log.warning("[STEP 3] No sentences for %ds -- skipping.\n", decade_start)
        return None

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    save_path = os.path.join(OUTPUT_DIR, "word2vec_%ds.model" % decade_start)

    log.info("[STEP 3] Training on %d sentences for %ds...",
             len(sentences), decade_start)

    # 3a -- Build vocabulary
    log.info("  3a. Building vocabulary...")
    model.build_vocab(sentences)
    log.info("      Vocabulary size: %d unique words", len(model.wv))

    # 3b -- Train
    log.info("  3b. Training word vectors...")
    model.train(
        sentences,
        total_examples = model.corpus_count,
        epochs         = model.epochs,
    )

    model.save(save_path)
    log.info("  Model saved to: %s\n", save_path)
    return save_path

# ── Optional: Querying the model ───────────────────────────────────
# def query_model(model_path: str, words: list = None, topn: int = 50):
#     """
#     Load a saved model and print nearest neighbours for a list of words.
#     Use this to verify the model trained correctly.

#     Example
#     -------
#         query_model("models/word2vec_1850s.model", ["war", "slavery"])
#     """
#     if words is None:
#         words = ["war", "freedom", "slavery", "women", "president"]

#     log.info("Querying model: %s", model_path)
#     model = Word2Vec.load(model_path)
#     log.info("  Vocabulary size: %d", len(model.wv))

#     for word in words:
#         if word in model.wv:
#             neighbours = model.wv.most_similar(word, topn=topn)
#             formatted  = ", ".join("%s(%.2f)" % (w, s) for w, s in neighbours)
#             log.info("  %-15s -> %s", word, formatted)
#         else:
#             log.info("  %-15s -> (not in vocabulary)", word)