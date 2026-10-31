from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.agents.orchestrator import orchestrator

router = APIRouter(tags=["Chat & AI Copilot"])

class ChatRequest(BaseModel):
    message: str
    projectId: Optional[str] = "SHU-FOP-001"
    mode: Optional[str] = "conversational" # 'conversational' or 'research'
    history: Optional[List[Dict[str, str]]] = []

@router.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    response = await orchestrator.process_query(
        query=req.message,
        active_project_id=req.projectId,
        mode=req.mode or "conversational",
        history=req.history
    )
    return response

@router.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            message = data.get("message", "")
            project_id = data.get("projectId")
            mode = data.get("mode", "conversational")
            history = data.get("history", [])

            response = await orchestrator.process_query(
                query=message,
                active_project_id=project_id,
                mode=mode,
                history=history
            )
            await websocket.send_json(response)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass
