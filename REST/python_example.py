"""
REST API Example (Python)
--------------------------
Part A: A minimal REST server using Flask exposing a weather resource.
Part B: A REST client using `requests` that consumes the API.

Install dependencies:
    pip install flask requests --break-system-packages
"""

# ---------------------------------------------------------------------------
# PART A: REST SERVER (Flask)
# ---------------------------------------------------------------------------
from flask import Flask, jsonify, request

app = Flask(__name__)

# In-memory "database" for demonstration
WEATHER_DB = {
    "hyderabad": {
        "temperature_c": 29.4,
        "humidity_percent": 68,
        "condition": "Partly Cloudy",
    }
}
FAVORITES_DB = {}


@app.route("/v1/cities/<city>/forecast", methods=["GET"])
def get_forecast(city):
    """Resource: forecast for a given city. Verb: GET (read-only)."""
    data = WEATHER_DB.get(city.lower())
    if not data:
        return jsonify({"error": "City not found"}), 404
    return jsonify({"city": city, "current": data}), 200


@app.route("/v1/users/<int:user_id>/favorites", methods=["POST"])
def add_favorite(user_id):
    """Resource: a user's favorite cities. Verb: POST (create)."""
    payload = request.get_json()
    city = payload.get("city")
    FAVORITES_DB.setdefault(user_id, []).append(city)
    return jsonify({"user_id": user_id, "favorites": FAVORITES_DB[user_id]}), 201


# ---------------------------------------------------------------------------
# PART B: REST CLIENT (requests)
# ---------------------------------------------------------------------------
import requests

BASE_URL = "http://localhost:5000/v1"


def get_weather(city: str):
    response = requests.get(f"{BASE_URL}/cities/{city}/forecast")
    response.raise_for_status()
    return response.json()


def add_to_favorites(user_id: int, city: str):
    response = requests.post(
        f"{BASE_URL}/users/{user_id}/favorites",
        json={"city": city},
    )
    response.raise_for_status()
    return response.json()


if __name__ == "__main__":
    # Run the server with: flask --app python_example run
    # Then, in a separate script/session, call:
    #   print(get_weather("hyderabad"))
    #   print(add_to_favorites(42, "hyderabad"))
    app.run(debug=True)
