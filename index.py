from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your prediction routes
@app.post("/api/predict")
async def predict(data: dict):
    # Your Random Forest prediction logic
    return {"prediction": result}

# Serve static files
app.mount("/", StaticFiles(directory="public", html=True), name="public")
