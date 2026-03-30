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
def clean_results(results):
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