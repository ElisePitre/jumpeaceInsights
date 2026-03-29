# Quick testing program for query route, returns results
import requests

#query route test
url = "http://localhost:3000/query"

data = {"query_word": "apple", "start_time": 1800, "end_time": 1810}

response = requests.post(url, json=data)
print(response.json())

# Test /decade/compare route
url = "http://localhost:3000/decade/compare"

data = {
    "query_word":       "war",
    "destination_word": "freedom",
    "start_year":       1770,
    "end_year":         1880
}
response = requests.post(url, json=data)
print("Decade route:", response.json())