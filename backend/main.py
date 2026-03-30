from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router

app = FastAPI(title="Gemini AI Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ← fixed this too
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {"status": "Backend running with Google Gemini"}