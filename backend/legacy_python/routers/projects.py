from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.database import get_all_projects, get_project_by_id, get_stats

router = APIRouter(prefix="/api", tags=["Projects"])

@router.get("/projects")
def list_projects(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    domain: Optional[str] = None,
    search: Optional[str] = None
):
    projects = get_all_projects(limit=limit, offset=offset, domain=domain, search=search)
    return {"total": len(projects), "projects": projects}

@router.get("/projects/{project_id}")
def get_project(project_id: str):
    p = get_project_by_id(project_id)
    if not p:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    return p

@router.get("/stats")
def portfolio_stats():
    return get_stats()

@router.get("/compare")
def compare_projects(ids: str = Query(..., description="Comma separated project IDs")):
    id_list = [i.strip() for i in ids.split(",") if i.strip()]
    results = []
    for pid in id_list:
        p = get_project_by_id(pid)
        if p:
            results.append(p)
    return {"projects": results}
