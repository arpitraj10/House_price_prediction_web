"""
Train a house price prediction model using Bangalore housing data
(representative synthetic data matching real feature distributions)
"""
import numpy as np
import pickle
import json

np.random.seed(42)

LOCATIONS = [
    "1st Block Jayanagar", "1st Phase JP Nagar", "2nd Phase Judicial Layout",
    "Bannerghatta Road", "Basavangudi", "Bellandur", "Electronic City",
    "Frazer Town", "HSR Layout", "Hebbal", "Hoodi", "Indira Nagar",
    "JP Nagar", "Jayanagar", "Kalyan Nagar", "Kammanahalli", "Koramangala",
    "KR Puram", "Marathahalli", "Mysore Road", "Old Airport Road",
    "Rajaji Nagar", "Rajiv Nagar", "Sarjapur Road", "Thanisandra",
    "Uttarahalli", "Vijayanagar", "Whitefield", "Yelahanka", "Yeshwanthpur",
    "Banaswadi", "Banashankari", "BTM Layout", "Chandapura", "Devanahalli",
    "Domlur", "Gunjur", "Hennur", "Hulimavu", "Kadugodi", "Kanakpura Road",
    "Kengeri", "Kothanur", "Kudlu", "Kumaraswamy Layout", "Lingarajapura",
    "Mahadevapura", "Malleshwaram", "Nagarbhavi", "Nagasandra",
    "Old Madras Road", "Panathur", "Ramamurthy Nagar", "Sarjapur",
    "Talaghattapura", "Varthur", "Vidyaranyapura", "Willowmere"
]

N = 8000
location_idx = np.random.randint(0, len(LOCATIONS), N)
location_names = [LOCATIONS[i] for i in location_idx]

# Premium locations
premium = {"Koramangala", "Indira Nagar", "Jayanagar", "Bannerghatta Road",
           "HSR Layout", "Whitefield", "Malleshwaram", "Basavangudi", "Domlur"}
location_premium = np.array([1.4 if loc in premium else 1.0 for loc in location_names])

sqft = np.random.uniform(500, 5000, N)
bhk = np.random.randint(1, 6, N)
bath = np.clip(bhk + np.random.randint(-1, 2, N), 1, 6)

price = (sqft * 4.5 * location_premium + bhk * 15 + bath * 10 +
         np.random.normal(0, 20, N))
price = np.clip(price / 100, 10, 900)

# One-hot encode locations
from sklearn.preprocessing import OneHotEncoder
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
import pandas as pd

df = pd.DataFrame({
    "location": location_names,
    "total_sqft": sqft,
    "bhk": bhk.astype(float),
    "bath": bath.astype(float),
    "price": price
})

# Remove outliers by price per sqft
df["price_per_sqft"] = df["price"] * 100000 / df["total_sqft"]
df = df[(df["price_per_sqft"] > 3000) & (df["price_per_sqft"] < 30000)]

# One-hot for locations
loc_dummies = pd.get_dummies(df["location"], drop_first=False)
X = pd.concat([df[["total_sqft","bhk","bath"]], loc_dummies], axis=1)
y = df["price"]

from sklearn.linear_model import Ridge
model = Ridge(alpha=1.0)
model.fit(X, y)

from sklearn.metrics import r2_score
y_pred = model.predict(X)
print(f"R² score: {r2_score(y, y_pred):.3f}")
print(f"Training samples: {len(df)}")

# Save model
with open("house_price_model.pkl", "wb") as f:
    pickle.dump(model, f)

# Save column metadata
columns = {
    "data_columns": ["total_sqft", "bhk", "bath"] + list(loc_dummies.columns)
}
with open("columns.json", "w") as f:
    json.dump(columns, f)

print("Model and columns saved!")
print(f"Total features: {len(columns['data_columns'])}")
