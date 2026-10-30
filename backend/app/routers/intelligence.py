from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from pathlib import Path

from app.services.erl_service import erl_service
from app.services.knowledge_graph import knowledge_graph_service
from app.services.forecast_service import forecast_service
from app.services.report_exporter import report_exporter
from app.database import get_industrial_areas, save_discussion, get_all_discussions

router = APIRouter(prefix="/api", tags=["Intelligence Services"])

# ERL Endpoint
@router.get("/erl/{project_id}")
def get_erl_assessment(project_id: str):
    res = erl_service.evaluate_project(project_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

# Knowledge Graph Endpoints
@router.get("/graph/data")
def get_graph_data():
    return knowledge_graph_service.build_graph()

@router.get("/graph/synergies/{project_id}")
def get_synergies(project_id: str):
    return {"synergies": knowledge_graph_service.discover_cross_faculty_synergies(project_id)}

# Forecasting Endpoint
@router.get("/forecast/{project_id}")
def get_forecast(project_id: str, horizon: int = Query(5, ge=1, le=10)):
    res = forecast_service.generate_forecast(project_id, horizon_years=horizon)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

# Industrial Areas Endpoint
@router.get("/industrial-areas")
def list_industrial_areas():
    return get_industrial_areas()

# Discussion Management Endpoints
class DiscussionCreate(BaseModel):
    id: str
    title: str
    projectId: Optional[str] = ""
    participants: Optional[str] = "ORIC Committee"
    fullTranscript: str
    aiSummary: str
    actionItems: Optional[List[str]] = []

@router.post("/discussions")
def create_discussion(d: DiscussionCreate):
    save_discussion(
        disc_id=d.id,
        title=d.title,
        project_id=d.projectId or "",
        participants=d.participants or "",
        transcript=d.fullTranscript,
        summary=d.aiSummary,
        action_items=d.actionItems or []
    )
    return {"status": "success", "id": d.id}

@router.get("/discussions")
def list_discussions():
    return {"discussions": get_all_discussions()}

# Report Generation & Download Endpoints
@router.get("/reports/download/{doc_format}/{project_id}")
def download_report(doc_format: str, project_id: str, report_type: str = "assessment"):
    doc_format = doc_format.lower()
    try:
        if doc_format == "pdf":
            file_path = report_exporter.export_pdf(project_id, report_type)
            media_type = "application/pdf"
        elif doc_format in ["docx", "word"]:
            file_path = report_exporter.export_docx(project_id, report_type)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        elif doc_format in ["xlsx", "excel"]:
            file_path = report_exporter.export_xlsx(project_id)
            media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        else:
            raise HTTPException(status_code=400, detail="Invalid format. Supported: pdf, docx, xlsx")

        return FileResponse(
            path=str(file_path),
            filename=file_path.name,
            media_type=media_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
