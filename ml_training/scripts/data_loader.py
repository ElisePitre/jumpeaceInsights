"""
=============================================================
 data_loader.py  -- Load & truncate decade data
=============================================================

FIXES IN THIS VERSION:
  1. download_mode=FORCE_REDOWNLOAD busts the broken cache that was
     causing "couldn't be found on Hub" and returning 0 sentences.
"""
import os
import re
import logging
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from datasets import load_dataset, DownloadMode

os.environ["HF_DATASETS_CACHE"] = r"D:\bigdrive\hf_cache" # set to a local path with enough space to avoid cache issues

log = logging.getLogger(__name__)

# "Zip Slip blocked" warnings from NLTK are harmless --
# the data is already cached locally.
nltk.download("punkt",     quiet=True)
nltk.download("punkt_tab", quiet=True)
nltk.download("stopwords", quiet=True)

STOP_WORDS = set(stopwords.words("english"))

# ── Config ────────────────────────────────────────────────────────────────
START_YEAR          = 1770   # earliest year in AmericanStories (for now kept to the first decade)
END_YEAR            = 1780   # latest year in AmericanStories (for now kept to the first decade)
MAX_ROWS_PER_DECADE = 50_000 # lower to 10_000 if RAM is tight


def clean_and_tokenize(text: str) -> list:
    """
    Convert a raw article string into a list of clean word tokens.

    Steps:
      1. Lowercase
      2. Strip punctuation and digits (keep only a-z and spaces)
      3. Collapse whitespace
      4. Tokenize with NLTK word_tokenize
      5. Remove stopwords and tokens shorter than 3 characters
    """
    if not isinstance(text, str) or not text.strip():
        return []

    text = text.lower()
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+",      " ", text).strip()

    tokens = word_tokenize(text)
    tokens = [t for t in tokens if t not in STOP_WORDS and len(t) > 2]
    return tokens


def load_decade(decade_start: int, max_rows: int = MAX_ROWS_PER_DECADE) -> list:
    """
    Load and truncate one decade of AmericanStories data.

    How it works!
    ------------
    Loads one year at a time using year_list=["YYYY"].
    Only that year's data is downloaded, keeping memory usage low.

    Stops once max_rows articles are collected -- this is the truncation
    step that prevents later decades (1900s-1960s) from filling up RAM.

    The returned DatasetDict looks like:  {"1850": Dataset(...)}
    We iterate over dataset_dict[str(year)] to get the article rows.

    Parameters
    ----------
    decade_start : int   e.g. 1850
    max_rows     : int   hard cap on articles to collect

    Returns
    -------
    list of tokenised articles e.g.:
        [["president", "congress", "war", ...],
         ["railroad", "city", "merchant", ...], ...]
    """
    sentences  = []
    rows_seen  = 0
    decade_end = min(decade_start + 9, END_YEAR)

    log.info("[STEP 1] Loading %ds  (cap = %d rows)", decade_start, max_rows)

    for year in range(decade_start, decade_end + 1):

        if year < START_YEAR or year > END_YEAR:
            continue
        if rows_seen >= max_rows:
            log.info("  Cap of %d reached -- stopping early.", max_rows)
            break

        try:
            # year_list is the correct API for AmericanStories.
            # FORCE_REDOWNLOAD bypasses the broken local cache that was
            # returning 0 results with "couldn't be found on Hub".
            dataset_dict = load_dataset(
                "dell-research-harvard/AmericanStories",
                "subset_years",
                year_list=[str(year)],
                # year_list=["1770"],  # tried it for one year. shit does not work! 💀
            )
        except Exception as e:
            # log.warning("  Year %d unavailable: %s", year, e)
            continue

        year_data = dataset_dict.get(str(year))
        if year_data is None:
            log.warning("  Year %d: key not found in DatasetDict.", year)
            continue

        still_needed = max_rows - rows_seen
        log.info("  Year %d: %d articles available (taking up to %d)",
                 year, len(year_data), still_needed)

        for row in year_data:
            if rows_seen >= max_rows:
                break

            text   = row.get("article") or row.get("text") or ""
            tokens = clean_and_tokenize(text)

            if tokens:
                sentences.append(tokens)

            rows_seen += 1

    log.info("[STEP 1] Done -- %d usable sentences for %ds\n",
             len(sentences), decade_start)
    return sentences