import os
import json
import pickle
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow all origins (React frontend)

# ── Load model & column data ──────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, "house_price_model.pkl"), "rb") as f:
    MODEL = pickle.load(f)

with open(os.path.join(BASE_DIR, "columns.json")) as f:
    DATA_COLUMNS = json.load(f)["data_columns"]

LOCATIONS = sorted([
    col for col in DATA_COLUMNS
    if col not in ("total_sqft", "bhk", "bath")
])

# ── Helpers ───────────────────────────────────────────────────────────────────

def predict_price(location: str, sqft: float, bhk: int, bath: int) -> float:
    x = np.zeros(len(DATA_COLUMNS))
    x[0] = sqft
    x[1] = bhk
    x[2] = bath
    if location in DATA_COLUMNS:
        loc_idx = DATA_COLUMNS.index(location)
        x[loc_idx] = 1
    return round(float(MODEL.predict([x])[0]), 2)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return jsonify({"status": "ok", "message": "House Price Prediction API"})


@app.route("/api/locations", methods=["GET"])
def get_locations():
    return jsonify({"locations": LOCATIONS})


@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)

    # Validate required fields
    required = ["location", "total_sqft", "bhk", "bath"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        location = str(data["location"]).strip()
        sqft = float(data["total_sqft"])
        bhk = int(data["bhk"])
        bath = int(data["bath"])
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid input: {e}"}), 400

    # Range validation
    if sqft < 300 or sqft > 10000:
        return jsonify({"error": "total_sqft must be between 300 and 10000"}), 400
    if bhk < 1 or bhk > 10:
        return jsonify({"error": "bhk must be between 1 and 10"}), 400
    if bath < 1 or bath > 10:
        return jsonify({"error": "bath must be between 1 and 10"}), 400

    price = predict_price(location, sqft, bhk, bath)
    return jsonify({
        "price": price,
        "price_in_rupees": f"₹ {price:.2f} Lakhs",
        "location": location,
        "total_sqft": sqft,
        "bhk": bhk,
        "bath": bath
    })


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "model_loaded": MODEL is not None})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
