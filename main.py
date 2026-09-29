from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib
import traceback
import os
from fastapi.middleware.cors import CORSMiddleware
# Create FastAPI application
app = FastAPI(
    title="Sales Prediction API",
    description="Random Forest Sales Prediction Backend",
    version="1.0"
)
# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"]
)
# Load trained model
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "sales_model.pkl"
)

try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully!")

except Exception as e:
    print("MODEL LOADING ERROR:", e)
    model = None


# Input data format
class SalesData(BaseModel):
    Advertising_Budget: float
    Store_Size: float
    Discount_Percentage: float


# Home API
@app.get("/")
def home():
    return {
        "message": "Sales Prediction API is running"
    }


# Health check API
@app.get("/health")
def health():
    return {
        "status": "healthy" if model is not None else "model_not_loaded"
    }


# Sales prediction API
@app.post("/predict")
def predict_sales(data: SalesData):

    try:

        # Check model availability
        if model is None:
            raise HTTPException(
                status_code=500,
                detail="Model not loaded. Run train_model.py first."
            )

        # Convert input into DataFrame
        input_data = pd.DataFrame(
            [[
                data.Advertising_Budget,
                data.Store_Size,
                data.Discount_Percentage
            ]],
            columns=[
                "Advertising_Budget",
                "Store_Size",
                "Discount_Percentage"
            ]
        )

        # Predict sales
        prediction = model.predict(input_data)

        # Extract the first prediction
        estimated_sales = float(prediction[0])

        # Return JSON response
        return {
            "Advertising_Budget": data.Advertising_Budget,
            "Store_Size": data.Store_Size,
            "Discount_Percentage": data.Discount_Percentage,
            "Predicted_Total_Sales": round(estimated_sales, 2)
        }

    except HTTPException:
        raise

    except Exception as e:

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )