from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
        "project": "MedLens AI",
        "status": "running"
    }