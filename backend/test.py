# Quick testing program for query route, returns results
import requests

url = "http://localhost:3000/query"

data = {"query_word": "apple", "start_time": 1800, "end_time": 1810}

response = requests.post(url, json=data)
print(response.json())