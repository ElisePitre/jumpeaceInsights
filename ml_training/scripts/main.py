"""
=============================================================
 main.py  -- Entry point: runs all decades end-to-end
=============================================================

Run with:
    python main.py

Requires data_loader.py and model_trainer.py in the same folder.

SETUP (all team members must do this once before running):
  1. Get a free HuggingFace token at huggingface.co/settings/tokens
     (Read access only is fine)
  2. Set the token in your terminal before running:
       Windows:   set HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
       Mac/Linux: export HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
  3. Optional: if you want the cache on a specific drive, also set:
       Windows:   set HF_DATASETS_CACHE=D:\\hf_cache
       Mac/Linux: export HF_DATASETS_CACHE=/mnt/data/hf_cache
     Otherwise it defaults to an hf_cache/ folder next to this script.

FIXES IN THIS VERSION:
  1. Year range driven by START_YEAR / END_YEAR in data_loader.py.
  2. HF_TOKEN env-var passed through to load_decade().
  3. Existing model check uses os.path.join for cross-platform safety.
"""
import os
import logging
from data_loader   import load_decade, START_YEAR, END_YEAR, MAX_ROWS_PER_YEAR
from model_trainer import build_model, train_and_save, OUTPUT_DIR

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

# HF_TOKEN -- required to download from the Hub without hitting rate limits.
# Get a free token at huggingface.co/settings/tokens (Read access only).
# Set it via:  set HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx  (Windows)
#              export HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx  (Mac/Linux)
HF_TOKEN = os.environ.get("HF_TOKEN")
if not HF_TOKEN:
    log.warning("HF_TOKEN not set -- downloads may fail due to rate limiting. "
                "Get a free token at huggingface.co/settings/tokens")


def get_decades(start: int, end: int) -> list:
    """Return list of decade-start years, e.g. [1850, 1860, ..., 1960]."""
    first = (start // 10) * 10
    last  = (end   // 10) * 10
    return list(range(first, last + 1, 10))


def main():
    log.info("=" * 60)
    log.info("Jumpeace Insights -- Decade-wise Word2Vec Training")
    log.info("Years: %d to %d  |  Cap per year: %d",
             START_YEAR, END_YEAR, MAX_ROWS_PER_YEAR)
    log.info("=" * 60)

    decades      = get_decades(START_YEAR, END_YEAR)
    saved_models = {}

    for decade in decades:
        log.info("-" * 50)
        log.info("DECADE: %ds", decade)
        log.info("-" * 50)

        # STEP 2 -- check if model already exists before bothering to load data
        model_path = os.path.join(OUTPUT_DIR, "word2vec_%ds.model" % decade)
        if os.path.exists(model_path):
            log.info("[STEP 2] Model for %ds already exists -- skipping training.\n", decade)
            saved_models["%ds" % decade] = model_path
            continue

        # STEP 1 -- load & truncate
        sentences = load_decade(decade, hf_token=HF_TOKEN)

        # STEP 2 -- build model
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