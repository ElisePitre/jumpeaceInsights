# the years go from 1770 to 1964. I think it is good to use only until 1960 so we can maintain the decades.

from datasets import load_dataset
import os

os.environ["HF_DATASETS_CACHE"] = r"D:\bigdrive\hf_cache"

dataset = load_dataset(
    "dell-research-harvard/AmericanStories",
    "subset_years",
    year_list=["1809"],
)
# Dataset is a with key as the year and value as the list of stories in that year
print(dataset)

