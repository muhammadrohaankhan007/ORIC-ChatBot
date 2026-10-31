import sqlite3
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger("shu_oric.database")

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables and seeds initial project records from raw_projects.json"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Projects Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        department TEXT,
        faculty_pi TEXT,
        co_supervisors TEXT,
        course_code TEXT,
        course_title TEXT,
        class_nbr TEXT,
        semester TEXT,
        exhibition_id TEXT,
        student_group TEXT,
        students_count INTEGER,
        abstract TEXT,
        submission_date TEXT,
        domain TEXT,
        technologies TEXT,        -- JSON array
        products TEXT,            -- JSON array
        services TEXT,            -- JSON array
        matched_areas TEXT,       -- JSON array
        market_sizing TEXT,       -- JSON object
        growth_forecast TEXT,     -- JSON object
        commercialization TEXT,   -- JSON object
        document_source TEXT,
        excel_row_index INTEGER,
        last_modified TEXT,
        raw_json TEXT
    )
    ''')

    # 2. Industrial Areas Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS industrial_areas (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        relevance_score REAL,
        target_enterprises TEXT, -- JSON array
        collaboration_role TEXT,
        description TEXT
    )
    ''')

    # 3. Industry Sectors Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS industry_sectors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        domain TEXT,
        description TEXT
    )
    ''')

    # 4. ERL Evaluations Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS erl_evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT NOT NULL,
        learning_score REAL DEFAULT 0,
        innovation_score REAL DEFAULT 0,
        team_score REAL DEFAULT 0,
        market_score REAL DEFAULT 0,
        technology_score REAL DEFAULT 0,
        business_model_score REAL DEFAULT 0,
        ip_score REAL DEFAULT 0,
        funding_score REAL DEFAULT 0,
        overall_erl REAL DEFAULT 0,
        evidence_json TEXT,
        bottlenecks_json TEXT,
        interventions_json TEXT,
        assessed_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )
    ''')

    # 5. Saved Discussions & Transcripts Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS discussions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        project_id TEXT,
        participants TEXT,
        full_transcript TEXT,
        ai_summary TEXT,
        action_items TEXT,     -- JSON array
        created_at TEXT
    )
    ''')

    # 6. Institutional Audit Logs Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT,
        description TEXT,
        user_role TEXT,
        timestamp TEXT
    )
    ''')

    conn.commit()

    # Check if projects need seeding
    cursor.execute("SELECT COUNT(*) FROM projects")
    count = cursor.fetchone()[0]

    raw_path = settings.DATA_DIR / "raw_projects.json"
    if count == 0 and raw_path.exists():
        print(f"Seeding database from {raw_path}...")
        try:
            with open(raw_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Insert projects
            projects = data.get("projects", [])
            for p in projects:
                cursor.execute('''
                INSERT INTO projects (
                    id, title, department, faculty_pi, co_supervisors, course_code, course_title,
                    class_nbr, semester, exhibition_id, student_group, students_count, abstract,
                    submission_date, domain, technologies, products, services, matched_areas,
                    market_sizing, growth_forecast, commercialization, document_source,
                    excel_row_index, last_modified, raw_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    p.get("id"),
                    p.get("title", "Untitled Project"),
                    p.get("department", "Faculty of Pharmacy (FoP)"),
                    p.get("facultyPI", ""),
                    json.dumps(p.get("coSupervisors", [])),
                    p.get("courseCode", ""),
                    p.get("courseTitle", ""),
                    p.get("classNbr", ""),
                    p.get("semester", ""),
                    p.get("exhibitionId", ""),
                    p.get("studentGroup", ""),
                    p.get("studentsCount", 0),
                    p.get("abstract", ""),
                    p.get("submissionDate", ""),
                    p.get("domain", ""),
                    json.dumps(p.get("technologies", [])),
                    json.dumps(p.get("products", [])),
                    json.dumps(p.get("services", [])),
                    json.dumps(p.get("matchedAreas", [])),
                    json.dumps(p.get("marketSizing", {})),
                    json.dumps(p.get("growthForecast", {})),
                    json.dumps(p.get("commercialization", {})),
                    p.get("documentSource", ""),
                    p.get("excelRowIndex", 0),
                    p.get("lastModified", datetime.utcnow().isoformat()),
                    json.dumps(p)
                ))

            # Insert industrial areas
            areas = data.get("industrialAreas", [])
            for a in areas:
                cursor.execute('''
                INSERT OR REPLACE INTO industrial_areas (id, name, relevance_score, target_enterprises, collaboration_role, description)
                VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    a.get("id", f"AREA-{a.get('name')}"),
                    a.get("name"),
                    a.get("relevanceScore", 85),
                    json.dumps(a.get("targetEnterprises", [])),
                    a.get("collaborationRole", ""),
                    a.get("description", "")
                ))

            # Insert sectors
            sectors = data.get("sectors", [])
            for s in sectors:
                sec_id = s.get("id", s.get("name", "").lower().replace(" ", "-"))
                cursor.execute('''
                INSERT OR REPLACE INTO industry_sectors (id, name, domain, description)
                VALUES (?, ?, ?, ?)
                ''', (
                    sec_id,
                    s.get("name"),
                    s.get("domain", ""),
                    s.get("description", "")
                ))

            conn.commit()
            print(f"Successfully seeded {len(projects)} projects, {len(areas)} industrial areas, {len(sectors)} sectors.")
        except Exception as e:
            print(f"Error seeding database: {e}")

    conn.close()

# Database Query Functions
def get_all_projects(limit: int = 500, offset: int = 0, domain: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM projects WHERE 1=1"
    params = []

    if domain:
        query += " AND domain LIKE ?"
        params.append(f"%{domain}%")

    if search:
        query += " AND (title LIKE ? OR abstract LIKE ? OR faculty_pi LIKE ? OR domain LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s, s])

    query += " ORDER BY id ASC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [row_to_project_dict(r) for r in rows]

def get_project_by_id(project_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ? OR title LIKE ?", (project_id, f"%{project_id}%"))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return row_to_project_dict(row)

def get_stats() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM projects")
    total_projects = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(DISTINCT domain) FROM projects")
    total_domains = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(DISTINCT faculty_pi) FROM projects")
    total_faculty = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM industrial_areas")
    total_areas = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM discussions")
    total_discussions = cursor.fetchone()[0]

    conn.close()
    return {
        "totalProjects": total_projects,
        "totalDomains": total_domains,
        "totalFaculty": total_faculty,
        "totalIndustrialAreas": total_areas,
        "totalDiscussions": total_discussions,
        "institution": settings.INSTITUTION,
        "department": settings.DEPARTMENT
    }

def get_industrial_areas() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM industrial_areas")
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        result.append({
            "id": r["id"],
            "name": r["name"],
            "relevanceScore": r["relevance_score"],
            "targetEnterprises": json.loads(r["target_enterprises"]) if r["target_enterprises"] else [],
            "collaborationRole": r["collaboration_role"],
            "description": r["description"]
        })
    return result

def save_discussion(disc_id: str, title: str, project_id: str, participants: str, transcript: str, summary: str, action_items: list) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT OR REPLACE INTO discussions (id, title, project_id, participants, full_transcript, ai_summary, action_items, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        disc_id,
        title,
        project_id,
        participants,
        transcript,
        summary,
        json.dumps(action_items),
        datetime.utcnow().isoformat()
    ))
    conn.commit()
    conn.close()
    return True

def get_all_discussions() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM discussions ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "title": r["title"],
            "projectId": r["project_id"],
            "participants": r["participants"],
            "fullTranscript": r["full_transcript"],
            "aiSummary": r["ai_summary"],
            "actionItems": json.loads(r["action_items"]) if r["action_items"] else [],
            "createdAt": r["created_at"]
        })
    return results

def row_to_project_dict(r) -> Dict[str, Any]:
    return {
        "id": r["id"],
        "title": r["title"],
        "department": r["department"],
        "facultyPI": r["faculty_pi"],
        "coSupervisors": json.loads(r["co_supervisors"]) if r["co_supervisors"] else [],
        "courseCode": r["course_code"],
        "courseTitle": r["course_title"],
        "classNbr": r["class_nbr"],
        "semester": r["semester"],
        "exhibitionId": r["exhibition_id"],
        "studentGroup": r["student_group"],
        "studentsCount": r["students_count"],
        "abstract": r["abstract"],
        "submissionDate": r["submission_date"],
        "domain": r["domain"],
        "technologies": json.loads(r["technologies"]) if r["technologies"] else [],
        "products": json.loads(r["products"]) if r["products"] else [],
        "services": json.loads(r["services"]) if r["services"] else [],
        "matchedAreas": json.loads(r["matched_areas"]) if r["matched_areas"] else [],
        "marketSizing": json.loads(r["market_sizing"]) if r["market_sizing"] else {},
        "growthForecast": json.loads(r["growth_forecast"]) if r["growth_forecast"] else {},
        "commercialization": json.loads(r["commercialization"]) if r["commercialization"] else {},
        "documentSource": r["document_source"],
        "excelRowIndex": r["excel_row_index"],
        "lastModified": r["last_modified"]
    }
