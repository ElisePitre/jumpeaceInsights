import os
from dotenv import load_dotenv
import json
import sys
import psycopg2
from flask import Flask, request, jsonify
import time
from api.modelAPI import selectModels, calculate_weighted_average, merge_corrected_words

app = Flask(__name__)

@app.route("/query", methods=["POST"])
def processQuery():
    data = request.get_json()

    if not data or 'query_word' not in data:
        return jsonify({"error": "Missing data field"}), 400

    models = selectModels(data['start_time'], data['end_time'])
    results = calculate_weighted_average(data['query_word'], data['start_time'], data['end_time'], models)

    # Check clean_results parameter to correct and merge words
    if (data['clean_results'] == True):
        results = merge_corrected_words(results)


    # Sort and trim to top 100
    results.sort(key=lambda x: x["weighted_similarity"], reverse=True)
    top_results = results[:100]

    # Return top 100 results
    return jsonify({
        "query": data['query_word'],
        "results": top_results
    })

@app.route("/decade/compare", methods=["POST"]) 
def decadeCompare():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing data"}), 400

    missing = [f for f in ["query_word", "destination_word", "start_year", "end_year"] if f not in data]
    if missing:
        return jsonify({"error": "Missing fields: %s" % missing}), 400

    model   = decadeSelectModel(data["start_year"], data["end_year"])
    results = decadeQuery(model, data["query_word"], data["destination_word"])

    return jsonify({
        "query_word":       data["query_word"],
        "destination_word": data["destination_word"],
        "results":          results
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