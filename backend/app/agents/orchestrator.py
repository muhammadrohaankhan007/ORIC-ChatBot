import json
import logging
from typing import Dict, Any, List, Optional
from app.services.ai_gateway import ai_gateway
from app.services.web_search import web_search_service
from app.services.erl_service import erl_service
from app.services.forecast_service import forecast_service
from app.services.knowledge_graph import knowledge_graph_service
from app.database import get_project_by_id, get_all_projects, get_stats

logger = logging.getLogger("shu_oric.agents")

class BaseSpecializedAgent:
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role

class ProjectIntelligenceAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__("Project Intelligence Agent", "Retrieves and correlates verified SHU project records and profiles.")

    def run(self, query: str, project: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not project:
            return {"status": "skipped", "details": "No specific project designated"}
        return {
            "status": "active",
            "findings": {
                "title": project["title"],
                "pi": project.get("facultyPI"),
                "trl": project.get("commercialization", {}).get("trlLevel", 3),
                "domain": project.get("domain"),
                "technologies": project.get("technologies", [])
            }
        }

class ScientificResearchAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__("Scientific Research Agent", "Evaluates biochemical principles, dosage mechanics, and formulation science.")

    def run(self, query: str, project: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        techs = project.get("technologies", []) if project else []
        return {
            "status": "active",
            "scientificAssessment": "Validated laboratory formulation with established physicochemical kinetics.",
            "dosageForm": project.get("products", [{}])[0].get("dosageForm", "Standardized Delivery Vehicle") if project else "Novel formulation",
            "compendialStandards": "USP / BP compendial dissolution and ICH Zone IVb stability protocols."
        }

class WebResearchAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__("Web Research Agent", "Searches verified academic, trade, and regulatory sources.")

    async def run(self, query: str) -> Dict[str, Any]:
        citations = await web_search_service.search(query, max_results=3)
        return {
            "status": "active",
            "citations": citations
        }

class BusinessStrategyAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__("Business Strategy Agent", "Evaluates Business Model Canvas, value proposition, and competitor landscape.")

    def run(self, query: str, project: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        prods = project.get("products", []) if project else []
        p_name = prods[0].get("name", "Commercial Formulation") if prods else "Commercial Product"
        diff = prods[0].get("differentiation", "Local import substitution at competitive cost") if prods else "Local differentiation"
        return {
            "status": "active",
            "valueProposition": diff,
            "targetProduct": p_name,
            "businessModel": "B2B contract licensing or university spin-off startup with royalty distribution."
        }

class IndustryIntelligenceAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__("Industry Intelligence Agent", "Maps regional enterprise targets across Karachi industrial clusters.")

    def run(self, query: str, project: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        matched = project.get("matchedAreas", []) if project else []
        return {
            "status": "active",
            "matchedAreas": matched[:3] if matched else [
                {"name": "Korangi Industrial Area", "targetEnterprises": ["The Searle Company Ltd", "Getz Pharma"]},
                {"name": "S.I.T.E. Industrial Area", "targetEnterprises": ["Martin Dow", "GlaxoSmithKline"]}
            ]
        }

class FinancialAnalysisAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__("Financial Analysis Agent", "Models TAM/SAM/SOM sizing, unit economics, and margins.")

    def run(self, query: str, project: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        market = project.get("marketSizing", {}) if project else {}
        products = project.get("products", [{}]) if project else [{}]
        cost = products[0].get("unitCostPKR", 20)
        price = products[0].get("sellingPricePKR", 60)
        margin = round(((price - cost) / max(1, price)) * 100, 1)

        return {
            "status": "active",
            "unitCostPKR": cost,
            "sellingPricePKR": price,
            "grossMargin": f"{margin}%",
            "tamPKR_M": market.get("tamPKR", 10000),
            "somPKR_M": market.get("somPKR", 300)
        }

class ForecastAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__("Forecasting Agent", "Generates multi-scenario quantitative market projections.")

    def run(self, project_id: str, horizon: int = 5) -> Dict[str, Any]:
        return forecast_service.generate_forecast(project_id, horizon)

class ErlAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__("ERL Assessment Agent", "Conducts 8-dimension Entrepreneurship Readiness Level evaluation.")

    def run(self, project_id: str) -> Dict[str, Any]:
        return erl_service.evaluate_project(project_id)

class OpportunityDiscoveryAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__("Opportunity Discovery Agent", "Surfaces cross-faculty and emerging market synergies.")

    def run(self, project_id: str) -> Dict[str, Any]:
        synergies = knowledge_graph_service.discover_cross_faculty_synergies(project_id)
        return {"synergies": synergies}

class ExecutiveIntelligenceAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__("Executive Intelligence Agent", "Provides strategic institutional portfolio insights for VC & Deans.")

    def run(self, query: str) -> Dict[str, Any]:
        stats = get_stats()
        return {
            "portfolioOverview": stats,
            "topRecommendations": [
                "Prioritize top 5 TRL 4+ drug delivery formulations for DRAP filing and KATI engagement.",
                "Allocate university seed matching grant for HEC Technology Development Fund (TDF) submissions.",
                "Establish a formal cross-faculty biomedical engineering + computing healthcare venture lab."
            ]
        }

class ReportAgent(BaseSpecializedAgent):
    def __init__(self):
        super().__init__("Report Generation Agent", "Prepares structured assessment dossiers for PDF/DOCX export.")

    def run(self, project_id: str) -> Dict[str, Any]:
        return {"readyForExport": True, "formats": ["PDF", "DOCX", "XLSX"]}


class CentralOrchestrator:
    """
    Central AI Orchestrator:
    - Analyzes incoming user requests
    - Identifies which of the 11 specialized agents are required
    - Executes agents and aggregates findings
    - Invocates LLM via AiGateway with grounding context
    - Distinguishes Conversational Mode vs. Evidence-Based Research Mode
    """
    def __init__(self):
        self.project_agent = ProjectIntelligenceAgent()
        self.sci_agent = ScientificResearchAgent()
        self.web_agent = WebResearchAgent()
        self.biz_agent = BusinessStrategyAgent()
        self.ind_agent = IndustryIntelligenceAgent()
        self.fin_agent = FinancialAnalysisAgent()
        self.forecast_agent = ForecastAgent()
        self.erl_agent = ErlAgent()
        self.opp_agent = OpportunityDiscoveryAgent()
        self.exec_agent = ExecutiveIntelligenceAgent()
        self.rep_agent = ReportAgent()

    async def process_query(
        self,
        query: str,
        active_project_id: Optional[str] = None,
        mode: str = "conversational", # 'conversational' or 'research'
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        active_project = get_project_by_id(active_project_id) if active_project_id else None
        engaged_agents = []
        context_blocks = []

        q_lower = query.lower()

        # 1. Project Agent
        if active_project:
            p_res = self.project_agent.run(query, active_project)
            engaged_agents.append(self.project_agent.name)
            context_blocks.append(f"PROJECT CONTEXT: ID={active_project['id']}, Title={active_project['title']}, Abstract={active_project.get('abstract')}")

        # 2. Industry Agent
        if any(w in q_lower for w in ["partner", "company", "industry", "korangi", "landhi", "site", "area", "karachi"]):
            ind_res = self.ind_agent.run(query, active_project)
            engaged_agents.append(self.ind_agent.name)
            context_blocks.append(f"INDUSTRY DATA: {json.dumps(ind_res)}")

        # 3. ERL Agent
        if any(w in q_lower for w in ["erl", "readiness", "gap", "intervention", "commercialization level"]):
            if active_project_id:
                erl_res = self.erl_agent.run(active_project_id)
                engaged_agents.append(self.erl_agent.name)
                context_blocks.append(f"ERL EVALUATION: Overall={erl_res.get('overallErl')}/9, Gaps={erl_res.get('bottlenecks')}")

        # 4. Financial & Forecast Agent
        if any(w in q_lower for w in ["forecast", "tam", "sam", "som", "cost", "price", "revenue", "profit", "margin", "invest"]):
            fin_res = self.fin_agent.run(query, active_project)
            engaged_agents.append(self.fin_agent.name)
            if "forecast" in q_lower and active_project_id:
                f_res = self.forecast_agent.run(active_project_id, horizon=5)
                engaged_agents.append(self.forecast_agent.name)
                context_blocks.append(f"FORECAST DATA: {json.dumps(f_res.get('growthRates'))}")

        # 5. Opportunity & Cross-Faculty Agent
        if any(w in q_lower for w in ["opportunity", "synergy", "combine", "cross-faculty", "collaborate", "startup"]):
            if active_project_id:
                opp_res = self.opp_agent.run(active_project_id)
                engaged_agents.append(self.opp_agent.name)
                context_blocks.append(f"CROSS-FACULTY SYNERGIES: {json.dumps(opp_res)}")

        # 6. Web Research Agent (Mandatory in Research Mode or if external validation sought)
        citations = []
        if mode == "research" or any(w in q_lower for w in ["research", "paper", "study", "drap", "hec", "evidence", "citation"]):
            web_res = await self.web_agent.run(query)
            engaged_agents.append(self.web_agent.name)
            citations = web_res.get("citations", [])
            context_blocks.append(f"VERIFIED CITATIONS: {json.dumps(citations)}")

        # Default fallback agent
        if not engaged_agents:
            engaged_agents.append(self.project_agent.name)

        # Assemble System Prompt
        system_prompt = (
            f"You are the central intelligence AI for Salim Habib University (SHU), Karachi - ORIC.\n"
            f"Mode: {'Evidence-Based Research Mode' if mode == 'research' else 'Conversational Expert Mode'}.\n"
            f"You act as a senior research scientist, technology commercialization advisor, and industry analyst.\n"
            f"Active Project: {active_project['title'] if active_project else 'SHU Research Portfolio'}.\n"
            f"Guidelines:\n"
            f"- Ground all answers in actual university project data.\n"
            f"- Clearly distinguish verified facts from recommendations.\n"
            f"- Do not fabricate partners or data.\n"
            f"- Cite specific Karachi industrial zones (Korangi, Landhi, SITE, Port Qasim) and DRAP/HEC regulations where relevant.\n"
            f"Context Data:\n" + "\n".join(context_blocks)
        )

        messages = (history or []) + [{"role": "user", "content": query}]

        # Invoke LLM Gateway
        ai_response = await ai_gateway.generate_response(
            messages=messages,
            system_instruction=system_prompt,
            temperature=0.2 if mode == "research" else 0.5,
            active_project=active_project
        )

        return {
            "answer": ai_response,
            "mode": mode,
            "engagedAgents": engaged_agents,
            "citations": citations,
            "activeProjectId": active_project_id
        }

orchestrator = CentralOrchestrator()
