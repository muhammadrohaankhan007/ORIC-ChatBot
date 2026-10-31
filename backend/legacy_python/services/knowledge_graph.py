import json
import logging
from typing import Dict, Any, List, Set
from app.database import get_all_projects, get_industrial_areas

logger = logging.getLogger("shu_oric.knowledge_graph")

class KnowledgeGraphService:
    def __init__(self):
        self._graph = None

    def build_graph(self) -> Dict[str, Any]:
        """
        Builds graph nodes and edges representing the entire SHU research ecosystem,
        connecting Projects, Technologies, Domains, Industrial Areas, and Enterprise Partners.
        """
        projects = get_all_projects(limit=250)
        areas = get_industrial_areas()

        nodes = []
        edges = []
        node_ids = set()

        def add_node(node_id: str, label: str, group: str, meta: Dict[str, Any] = None):
            if node_id not in node_ids:
                node_ids.add(node_id)
                nodes.append({
                    "id": node_id,
                    "label": label,
                    "group": group,
                    "meta": meta or {}
                })

        # 1. Add Faculty Nodes
        add_node("FAC_FOP", "Faculty of Pharmacy (FoP)", "Faculty", {"dean": "Dean, Faculty of Pharmacy"})
        add_node("FAC_ENG", "Faculty of Engineering & Computer Science", "Faculty", {"dean": "Dean, Engineering"})
        add_node("FAC_MGT", "Faculty of Management Sciences", "Faculty", {"dean": "Dean, Management"})

        # 2. Add Industrial Area Nodes
        for area in areas:
            a_id = f"AREA_{area['id']}"
            add_node(a_id, area["name"], "IndustrialArea", {"relevance": area["relevanceScore"]})

            # Add enterprise nodes
            for ent in area.get("targetEnterprises", []):
                ent_id = f"ENT_{ent.replace(' ', '_').replace('.', '')}"
                add_node(ent_id, ent, "Enterprise", {"area": area["name"]})
                edges.append({
                    "source": a_id,
                    "target": ent_id,
                    "relation": "HOSTS_ENTERPRISE",
                    "weight": 1.0
                })

        # 3. Add Project Nodes & Relational Edges
        for p in projects:
            p_id = f"PROJ_{p['id']}"
            add_node(p_id, p["title"][:45] + "...", "Project", {
                "full_id": p["id"],
                "trl": p.get("commercialization", {}).get("trlLevel", 3),
                "domain": p["domain"]
            })

            # Connect Project to Faculty
            edges.append({
                "source": "FAC_FOP",
                "target": p_id,
                "relation": "INCUBATES_PROJECT",
                "weight": 1.0
            })

            # Add Domain Node & Connect
            d_name = p.get("domain", "General Formulation")
            d_id = f"DOM_{d_name.replace(' ', '_').replace('&', 'and')}"
            add_node(d_id, d_name, "Domain")
            edges.append({
                "source": p_id,
                "target": d_id,
                "relation": "CATEGORIZED_UNDER",
                "weight": 1.0
            })

            # Add Technology Nodes & Connect
            for tech in p.get("technologies", []):
                tech_label = tech[:40] + ("..." if len(tech) > 40 else "")
                t_id = f"TECH_{abs(hash(tech)) % 100000}"
                add_node(t_id, tech_label, "Technology", {"full_tech": tech})
                edges.append({
                    "source": p_id,
                    "target": t_id,
                    "relation": "UTILIZES_TECH",
                    "weight": 1.5
                })

            # Connect to Matched Industrial Areas
            for m_area in p.get("matchedAreas", []):
                target_a_id = f"AREA_{m_area.get('id')}"
                if target_a_id in node_ids:
                    edges.append({
                        "source": p_id,
                        "target": target_a_id,
                        "relation": "MATCHED_WITH_AREA",
                        "weight": m_area.get("relevanceScore", 80) / 100.0
                    })

        self._graph = {"nodes": nodes, "edges": edges}
        return self._graph

    def discover_cross_faculty_synergies(self, project_id: str) -> List[Dict[str, Any]]:
        """
        Discovers non-obvious cross-disciplinary and cross-faculty synergies
        (e.g., combining drug delivery formulations with smart electronic sensors
        or AI clinical dosage algorithms).
        """
        projects = get_all_projects(limit=250)
        target = next((p for p in projects if p["id"] == project_id), None)
        if not target:
            target = projects[0] if projects else None
        if not target:
            return []

        synergies = []
        target_domain = target.get("domain", "")

        for p in projects:
            if p["id"] == target["id"]:
                continue

            # Check for technical complementary overlap
            shared_tech = set(p.get("technologies", [])).intersection(set(target.get("technologies", [])))
            domain_diff = p.get("domain", "") != target_domain

            if shared_tech or domain_diff:
                synergies.append({
                    "synergyPartnerId": p["id"],
                    "synergyPartnerTitle": p["title"],
                    "partnerDomain": p.get("domain"),
                    "synergyConcept": f"Combined {target['products'][0]['name'] if target.get('products') else 'Formulation'} with {p['products'][0]['name'] if p.get('products') else 'Delivery System'}",
                    "potentialApplication": "Dual-action therapeutic or Smart In-Vitro diagnostic kit for regional hospitals",
                    "estimatedTRLBoost": "+1.5 TRL levels",
                    "targetSponsors": ["HEC Technology Development Fund (TDF)", "Sindh Innovation & Research Fund (SIRF)"]
                })
            if len(synergies) >= 4:
                break

        return synergies

knowledge_graph_service = KnowledgeGraphService()
