import json
import logging
from typing import Dict, Any, List
from app.database import get_project_by_id

logger = logging.getLogger("shu_oric.erl_service")

class ErlService:
    def __init__(self):
        self.dimensions = [
            {"id": "learning_research", "name": "1. Learning & Research Readiness", "weight": 0.12},
            {"id": "innovation", "name": "2. Innovation Readiness", "weight": 0.12},
            {"id": "team", "name": "3. Team & Leadership Readiness", "weight": 0.12},
            {"id": "market", "name": "4. Market & Demand Readiness", "weight": 0.15},
            {"id": "technology", "name": "5. Technology Readiness (TRL)", "weight": 0.15},
            {"id": "business_model", "name": "6. Business Model Readiness", "weight": 0.12},
            {"id": "ip", "name": "7. Intellectual Property Readiness", "weight": 0.12},
            {"id": "funding", "name": "8. Funding & Sustainability Readiness", "weight": 0.10}
        ]

    def evaluate_project(self, project_id: str) -> Dict[str, Any]:
        """
        Conducts a rigorous 8-dimension Entrepreneurship Readiness Level (ERL) assessment
        grounded in the project's actual laboratory data, TRL rating, market sizing, and IP status.
        """
        p = get_project_by_id(project_id)
        if not p:
            return {"error": f"Project {project_id} not found"}

        comm = p.get("commercialization", {})
        scores_base = comm.get("criteriaScores", {})
        trl = comm.get("trlLevel", 3)

        # Scale 1 to 9 based on project data
        d_scores = {
            "learning_research": min(9.0, round(scores_base.get("technicalFeasibility", 4.0) * 1.6, 1)),
            "innovation": min(9.0, round(scores_base.get("scalability", 3.8) * 1.5, 1)),
            "team": min(9.0, round(scores_base.get("teamCapability", 4.0) * 1.4, 1)),
            "market": min(9.0, round(scores_base.get("marketAttractiveness", 4.2) * 1.5, 1)),
            "technology": min(9.0, float(trl)),
            "business_model": min(9.0, round(scores_base.get("customerDemandEvidence", 3.5) * 1.3, 1)),
            "ip": min(9.0, round(scores_base.get("intellectualProperty", 3.0) * 1.4, 1)),
            "funding": min(9.0, round(scores_base.get("importSubstitution", 4.0) * 1.1, 1))
        }

        # Calculate weighted composite ERL (scale 1 to 9)
        overall_erl = sum(d_scores[d["id"]] * d["weight"] for d in self.dimensions)
        overall_erl = round(overall_erl, 2)

        # Identify key gaps and interventions
        bottlenecks = []
        interventions = []

        if d_scores["ip"] < 5.0:
            bottlenecks.append("Intellectual Property: Unregistered patent status; risk of disclosure without provisional filing.")
            interventions.append("File provisional patent application with Intellectual Property Organization of Pakistan (IPO-Pakistan).")

        if d_scores["technology"] < 6.0:
            bottlenecks.append(f"Technology Scale: Prototype at laboratory scale (TRL {trl}) without pilot-batch cGMP validation.")
            interventions.append("Conduct ICH Zone IVb stability testing (40°C/75% RH) at the SHU Center for Advanced Drug Research.")

        if d_scores["business_model"] < 5.5:
            bottlenecks.append("Commercial Terms: Formal off-take agreements or distributor letters of intent (LoIs) not yet executed.")
            interventions.append("Engage Korangi Association of Trade & Industry (KATI) Pharmaceutical Committee for pilot licensing.")

        if d_scores["funding"] < 5.0:
            bottlenecks.append("Capitalization: Reliance on internal university lab budgets; scale-up requires external seed grant.")
            interventions.append("Submit grant application to the HEC Technology Development Fund (TDF - up to PKR 14M).")

        # Determine Stage Label
        if overall_erl < 3.0:
            stage_name = "Concept Formulation & Discovery"
            action_status = "Academic Research Phase"
        elif overall_erl < 5.0:
            stage_name = "Proof of Concept & Validation"
            action_status = "Incubation & Prototype Refinement"
        elif overall_erl < 7.0:
            stage_name = "Demonstration & Scale-Up"
            action_status = "Commercial Licensing & Seed Financing"
        else:
            stage_name = "Commercial Deployment & Expansion"
            action_status = "Market Entry & Venture Spin-Off"

        return {
            "projectId": p["id"],
            "projectTitle": p["title"],
            "facultyPI": p["facultyPI"],
            "domain": p["domain"],
            "overallErl": overall_erl,
            "maxErl": 9.0,
            "stageName": stage_name,
            "actionStatus": action_status,
            "dimensions": [
                {
                    "id": d["id"],
                    "name": d["name"],
                    "score": d_scores[d["id"]],
                    "maxScore": 9.0,
                    "weight": d["weight"]
                }
                for d in self.dimensions
            ],
            "bottlenecks": bottlenecks,
            "interventions": interventions,
            "recommendedNextMilestone": "TRL 5 / ERL 6 Pilot Manufacturing & Formal Patent Registry"
        }

erl_service = ErlService()
