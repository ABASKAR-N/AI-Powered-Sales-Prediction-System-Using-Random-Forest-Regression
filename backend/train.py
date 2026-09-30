
from pathlib import Path

import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATASET_PATH = PROJECT_ROOT / "sales_data.csv"
MODEL_PATH = Path(__file__).resolve().parent / "sales_model.pkl"

# Load dataset
df = pd.read_csv(DATASET_PATH)

# Remove missing values
df = df.dropna()

# Input features
X = df[
    [
        "Advertising_Budget",
        "Store_Size",
        "Discount_Percentage"
    ]
]

# Target
y = df["Total_Sales"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Create model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

# Train
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)

print("Model trained successfully!")
print("MAE:", mean_absolute_error(y_test, y_pred))
print("R2 Score:", r2_score(y_test, y_pred))

# Save trained model
joblib.dump(model, MODEL_PATH)

print(f"Model saved as {MODEL_PATH}")