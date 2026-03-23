import os
from dotenv import load_dotenv
import json
import sys
import psycopg2
from flask import Flask, request, jsonify
import time
from api.modelAPI import selectModel, query

app = Flask(__name__)

@app.route("/query", methods=["POST"])
def processQuery():
    data = request.get_json()

    if not data or 'query' not in data:
        return jsonify({"error": "Missing data field"}), 400

    model = selectModel(data['start_time'], data['end_time'])
    results = query(model, data['query_word'], data['destination_word'])

    return jsonify({
        "query": data['query_word'],
        "results": results
    })

@app.route("/searchCount", methods=["GET"])
def searchCount():
    # Query DB for search counts
    return jsonify({
        "results": [
            {"word": "First", "count": 1},
            {"word": "Second", "count": 2},
            {"word": "Third", "count": 3}
        ]
    })

def main():
    try:
        app.run(host='0.0.0.0', port=3000)
    except Exception as e:
        print(f"Application encountered an error: {e}")
        time.sleep(5)
        main()

if __name__ == "__main__":
    main()