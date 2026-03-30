from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config import client, supabase

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        # Get AI reply
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=request.message
        )
        reply = response.text

        # Save user message to DB
        supabase.table("messages").insert({
            "role": "user",
            "text": request.message
        }).execute()

        # Save AI reply to DB
        supabase.table("messages").insert({
            "role": "ai",
            "text": reply
        }).execute()

        return ChatResponse(reply=reply)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/history")
def get_history():
    try:
        result = supabase.table("messages")\
            .select("*")\
            .order("created_at", desc=False)\
            .execute()
        return {"messages": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")