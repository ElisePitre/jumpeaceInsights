"""
=============================================================
 data_loader.py  -- Load & truncate decade data
=============================================================

FIXES IN THIS VERSION:
  1. Full year range set to 1850–1963 (AmericanStories coverage).
  2. Cache is cleared immediately after each year's data has been
     extracted into sentences -- keeps disk usage low since we only
     ever need one year on disk at a time.
  3. Removed trust_remote_code -- no longer supported in newer versions
     of the datasets library and was crashing before any download could
     happen.
  4. HF_TOKEN is required to reliably reach the Hub. Without it,
     requests are rate-limited and the dataset appears unreachable.
     Set it via:  set HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx  (Windows)
                  export HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx  (Linux/Mac)
  5. Row cap is per year, not per decade -- each year contributes
     up to MAX_ROWS_PER_YEAR rows independently.
  6. Cache path is now portable -- defaults to an hf_cache/ folder
     next to this script so any team member can run it without
     changing any code. Override by setting HF_DATASETS_CACHE env var
     to a path on a drive with sufficient free space (each year needs
     ~2 GB during download).
"""
import os
import re
import glob
import shutil
import json
import logging
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from datasets import load_dataset

# ── Cache path -- portable across all team members' machines ─────────────
# Default: a folder called hf_cache/ sitting next to this script.
# Override: set HF_DATASETS_CACHE in your environment to point to any
# drive with at least 3 GB free (e.g. set HF_DATASETS_CACHE=D:\hf_cache)
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_DEFAULT_CACHE = os.path.join(_SCRIPT_DIR, "hf_cache")
os.environ["HF_DATASETS_CACHE"] = os.environ.get("HF_DATASETS_CACHE", _DEFAULT_CACHE)

log = logging.getLogger(__name__)
log.info("HF cache dir: %s", os.environ["HF_DATASETS_CACHE"])

# "Zip Slip blocked" warnings from NLTK are harmless --
# the data is already cached locally.
nltk.download("punkt",     quiet=True)
nltk.download("punkt_tab", quiet=True)
nltk.download("stopwords", quiet=True)

STOP_WORDS = set(stopwords.words("english"))

# ── Config ────────────────────────────────────────────────────────────────
START_YEAR        = 1770    # earliest year in AmericanStories CHANGE THIS YEARS
END_YEAR          = 1964    # latest year in AmericanStories
MAX_ROWS_PER_YEAR = 50_000  # cap applied per year, not per decade
                            # might lower to 10_000 if RAM is tight

# Keep this alias so main.py import doesn't break due to the rename from MAX_ROWS_PER_DECADE to MAX_ROWS_PER_YEAR
MAX_ROWS_PER_DECADE = MAX_ROWS_PER_YEAR

# Dataset identifier on HuggingFace
_DATASET_NAME   = "dell-research-harvard/AmericanStories"
_DATASET_CONFIG = "subset_years"

# The local cache folder name mirrors the HF naming convention
_CACHE_SLUG = "dell-research-harvard___american_stories"


# ── Cache helpers ─────────────────────────────────────────────────────────

def _year_cache_dirs(year: int) -> list:
    """
    Return every cache sub-directory that was created for a specific year.

    HuggingFace hashes the (dataset, config, year_list) combo into a
    folder name like:
        <cache_root>/dell-research-harvard___american_stories/
            subset_years-<hash>/

    We cannot easily recompute the hash from the outside, so instead we
    scan every subset_years-* folder and check the dataset_info.json
    inside to see if it mentions the target year.
    """
    dataset_cache = os.path.join(os.environ["HF_DATASETS_CACHE"], _CACHE_SLUG)
    if not os.path.isdir(dataset_cache):
        return []

    matches = []
    pattern = os.path.join(dataset_cache, "subset_years-*")
    for folder in glob.glob(pattern):
        info_path = os.path.join(folder, "dataset_info.json")
        if not os.path.isfile(info_path):
            # Also check one level deeper (splits sub-folder)
            info_path = os.path.join(folder, str(year), "dataset_info.json")
        if os.path.isfile(info_path):
            try:
                with open(info_path, "r", encoding="utf-8") as f:
                    info = json.load(f)
                # The year appears in the config name or description
                raw = json.dumps(info)
                if str(year) in raw:
                    matches.append(folder)
            except Exception:
                pass  # malformed json -- treat as unknown, leave alone

    return matches


def _clear_year_cache(year: int) -> None:
    """
    Delete all cached entries for a specific year.

    Called in two situations:
      - Before downloading, to remove any stale/mismatched entry that
        would block a clean download.
      - After extracting a year's data into sentences, to free up disk
        space before moving on to the next year.
    """
    dirs = _year_cache_dirs(year)
    if not dirs:
        log.debug("  Cache clear: no entry found for %d.", year)
        return

    for d in dirs:
        log.info("  Cache: clearing %d -> %s", year, d)
        try:
            shutil.rmtree(d)
        except Exception as e:
            log.warning("  Cache: could not remove %s: %s", d, e)


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


def load_decade(decade_start: int,
                max_rows: int = MAX_ROWS_PER_YEAR,
                hf_token: str | None = None) -> list:
    """
    Load and truncate one decade of AmericanStories data.

    How it works!
    ------------
    Loads one year at a time using year_list=["YYYY"].
    Only that year's data is downloaded, keeping memory usage low.

    For each year:
      1. Clear any stale cache entry, then download fresh.
      2. Extract up to max_rows articles -- the cap resets each year
         so a large year never cuts off the remaining years in the
         decade.
      3. Immediately wipe that year's cache entry -- we have the data
         in memory now and no longer need it on disk. This keeps disk
         usage flat (only ever one year on disk at a time).

    The returned DatasetDict looks like:  {"1850": Dataset(...)}
    We iterate over dataset_dict[str(year)] to get the article rows.

    Parameters
    ----------
    decade_start : int        e.g. 1850
    max_rows     : int        hard cap on articles per year (not per decade)
    hf_token     : str|None   HuggingFace token -- strongly recommended.
                              Without it, unauthenticated requests are
                              rate-limited and the Hub may appear
                              unreachable. Get one free at:
                              huggingface.co/settings/tokens

    Returns
    -------
    list of tokenised articles e.g.:
        [["president", "congress", "war", ...],
         ["railroad", "city", "merchant", ...], ...]
    """
    sentences  = []
    decade_end = min(decade_start + 9, END_YEAR)

    log.info("[STEP 1] Loading %ds  (cap = %d rows per year)", decade_start, max_rows)

    for year in range(decade_start, decade_end + 1):

        if year < START_YEAR or year > END_YEAR:
            continue

        # ── Clear any stale cache entry before downloading ────────────
        log.info("  Year %d: clearing any stale cache and downloading fresh.", year)
        _clear_year_cache(year)

        try:
            # year_list is the correct API for AmericanStories.
          
            # a script-based loader which HF requires explicit authorization for.
            load_kwargs = dict(
                path          = _DATASET_NAME,
                name          = _DATASET_CONFIG,
                year_list     = [str(year)],
                download_mode = "force_redownload",
    
            )
            if hf_token:
                load_kwargs["token"] = hf_token

            dataset_dict = load_dataset(**load_kwargs)

            # Added a debug line as 1780s was not giving back data -- Puneet
            # print(f"  Year {year}: available keys = {list(dataset_dict.keys())}") 
            # PS: turns out there is no data for 1780s 😅
        except Exception as e:
            log.warning("  Year %d unavailable: %s", year, e)
            continue

        year_data = dataset_dict.get(str(year))
        if year_data is None:
            log.warning("  Year %d: key not found in DatasetDict.", year)
            _clear_year_cache(year)  # clean up even on a miss
            continue

        log.info("  Year %d: %d articles available (taking up to %d)",
                 year, len(year_data), max_rows)

        # ── Row counter resets every year so the cap is per year ──────
        rows_seen = 0
        for row in year_data:
            if rows_seen >= max_rows:
                log.info("  Year %d: cap of %d reached -- moving to next year.",
                         year, max_rows)
                break

            text   = row.get("article") or row.get("text") or ""
            tokens = clean_and_tokenize(text)

            if tokens:
                sentences.append(tokens)

            rows_seen += 1

        # ── Data extracted -- wipe the cache for this year immediately.
        # The sentences are in memory; we don't need the files on disk
        # anymore and this keeps hf_cache/ from filling up. ───────────
        log.info("  Year %d: data extracted, clearing cache to free disk space.", year)
        _clear_year_cache(year)

    log.info("[STEP 1] Done -- %d usable sentences for %ds\n",
             len(sentences), decade_start)
    return sentences