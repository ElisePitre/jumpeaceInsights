"""
=============================================================
 main.py  -- Entry point: runs all decades end-to-end
=============================================================

Run with:
    python main.py

Requires data_loader.py and model_trainer.py in the same folder.

FIXES IN THIS VERSION:
  
"""
import os
import logging
from data_loader   import load_decade, START_YEAR, END_YEAR, MAX_ROWS_PER_DECADE
from model_trainer import build_model, train_and_save, query_model

# ── Logging ───────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("training.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)


def get_decades(start: int, end: int) -> list:
    """Return list of decade-start years, e.g. [1770, 1780, ..., 1960]."""
    first = (start // 10) * 10
    last  = (end   // 10) * 10
    return list(range(first, last + 1, 10))


def main():
    log.info("=" * 60)
    log.info("Jumpeace Insights -- Decade-wise Word2Vec Training")
    log.info("Years: %d to %d  |  Cap per decade: %d",
             START_YEAR, END_YEAR, MAX_ROWS_PER_DECADE)
    log.info("=" * 60)

    decades      = get_decades(START_YEAR, END_YEAR)
    saved_models = {}

    for decade in decades:
        log.info("-" * 50)
        log.info("DECADE: %ds", decade)
        log.info("-" * 50)

        # STEP 1 -- load & truncate
        sentences = load_decade(decade)

        # STEP 2 -- build model
        if (os.path.exists("models/word2vec_%ds.model" % decade)):
            log.info("[STEP 2] Model for %ds already exists -- skipping training.\n", decade)
            saved_models["%ds" % decade] = "models/word2vec_%ds.model" % decade
            continue
        model = build_model()

        # STEP 3 -- train & save
        path = train_and_save(model, sentences, decade)

        if path:
            saved_models["%ds" % decade] = path

    log.info("=" * 60)
    log.info("ALL DECADES COMPLETE")
    log.info("Trained %d model(s):", len(saved_models))
    for label, path in saved_models.items():
        log.info("  %s: %s", label, path)
    log.info("=" * 60)

    # Quick sanity check on first trained model, not needed for all decades. Just want to verify that the training worked and the model can be queried. -- Puneet
    # if saved_models:
    #     sample_path = list(saved_models.values())[0]
    #     query_model(sample_path, words=["revolution"])

    return saved_models


if __name__ == "__main__":
    main()