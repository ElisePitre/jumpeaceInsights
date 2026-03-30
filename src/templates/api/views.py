from flask import Blueprint, request, jsonify
from templates.api.modelAPI import selectModels, calculate_weighted_average
from templates.api.decadeAPI import selectModel as decadeSelectModel, query as decadeQuery
from templates.api.cleanResultsAPI import clean_results

api_blueprint = Blueprint("api", __name__, url_prefix="/api")

@api_blueprint.route("/query", methods=["POST"])
def processQuery():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing data"}), 400

    # Required fields
    missing = [f for f in ["query_word", "start_year", "end_year", "clean_results"] if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    # Main search
    models = selectModels(data['start_year'], data['end_year'])
    results = calculate_weighted_average(data['query_word'], data['start_year'], data['end_year'], models)

    if not results:
        return jsonify({"error": "No results found. Please try a different word or adjust the date range."}), 404

    if data.get('clean_results'):
        results = clean_results(results)

    results.sort(key=lambda x: x["weighted_similarity"], reverse=True)
    top_results = results[:100]

    response = {
        "query": data['query_word'],
        "results": top_results
    }

    # Run decade comparison if a destination word is provided
    destination_word = data.get('destination_word', '').strip()
    if destination_word:
        model = decadeSelectModel(data["start_year"], data["end_year"])
        decade_results = decadeQuery(model, data["query_word"], destination_word)
        response["decade_comparison_results"] = {
            "term_a": data["query_word"],
            "term_b": destination_word,
            "results": decade_results
        }

    return jsonify(response)

@api_blueprint.route("/searchCount", methods=["GET"])
def searchCount():
    return jsonify({
        "results": [
            {"word": "revolution", "count": 142},
            {"word": "trade", "count": 115},
            {"word": "industry", "count": 103},
            {"word": "science", "count": 92},
            {"word": "empire", "count": 78}
        ]
    })