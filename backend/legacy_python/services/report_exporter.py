import os
import io
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
import docx
from docx.shared import Inches, Pt, RGBColor
import openpyxl

from app.config import settings
from app.database import get_project_by_id

class ReportExporter:
    def export_pdf(self, project_id: str, report_type: str = "assessment") -> Path:
        """Generates a high-quality PDF report dossier using ReportLab."""
        p = get_project_by_id(project_id)
        if not p:
            raise ValueError(f"Project {project_id} not found")

        out_path = settings.REPORTS_DIR / f"{p['id']}_{report_type}_report.pdf"
        doc = SimpleDocTemplate(str(out_path), pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            textColor=colors.HexColor('#0A2540'),
            spaceAfter=6
        )
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor('#0D9488'),
            spaceAfter=14
        )
        body_style = ParagraphStyle(
            'ReportBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor('#1E293B'),
            spaceAfter=8
        )
        h2_style = ParagraphStyle(
            'ReportH2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            textColor=colors.HexColor('#0A2540'),
            spaceBefore=10,
            spaceAfter=4
        )

        elements = []

        # Header Banner
        header_text = f"<b>SALIM HABIB UNIVERSITY (SHU), KARACHI</b><br/>Office of Research, Innovation & Commercialization (ORIC)"
        elements.append(Paragraph(header_text, subtitle_style))
        elements.append(Paragraph(f"INSTITUTIONAL INTELLIGENCE DOSSIER: {report_type.upper()}", title_style))
        elements.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')} | Confidential University Record", subtitle_style))
        elements.append(Spacer(1, 10))

        # Project Metadata Table
        meta_data = [
            ["Project Identifier:", p["id"], "Faculty / Department:", p.get("department", "Faculty of Pharmacy")],
            ["Lead Investigator (PI):", p.get("facultyPI", "Faculty Team"), "Current TRL Level:", f"TRL {p.get('commercialization', {}).get('trlLevel', 3)}"],
            ["Academic Course:", f"{p.get('courseCode', '')} - {p.get('courseTitle', '')}", "Research Domain:", p.get("domain", "Biochemistry / NDDS")]
        ]
        t = Table(meta_data, colWidths=[120, 150, 120, 150])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#0A2540')),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,0), (-1,-1), 8.5),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 12))

        # Executive Abstract
        elements.append(Paragraph("1. Executive Research Summary", h2_style))
        elements.append(Paragraph(p.get("abstract", "No abstract available."), body_style))
        elements.append(Spacer(1, 8))

        # Commercialization Assessment
        comm = p.get("commercialization", {})
        elements.append(Paragraph("2. Commercial Readiness & Market Potential", h2_style))
        comm_text = (
            f"<b>Readiness Level:</b> {comm.get('trlDescription', 'TRL 3')}<br/>"
            f"<b>Commercial Score:</b> {comm.get('overallScore', '3.8')} / 5.0 (Priority: {comm.get('priority', 'Medium')})<br/>"
            f"<b>Strategic Recommendation:</b> {comm.get('recommendation', 'Prototype Refinement & Incubation')}"
        )
        elements.append(Paragraph(comm_text, body_style))

        # Market Sizing & Karachi Partners
        elements.append(Paragraph("3. Market Sizing & Karachi Industrial Targets", h2_style))
        market = p.get("marketSizing", {})
        m_text = (
            f"<b>Total Addressable Market (TAM):</b> PKR {market.get('tamPKR', 10000)}M (${market.get('tamUSD', 35)}M)<br/>"
            f"<b>Serviceable Obtainable Market (SOM):</b> PKR {market.get('somPKR', 300)}M (${market.get('somUSD', 1.0)}M)<br/>"
            f"<b>Sizing Methodology:</b> {market.get('methodology', 'Bottom-up hospital & retail modeling.')}"
        )
        elements.append(Paragraph(m_text, body_style))

        # Build PDF
        doc.build(elements)
        return out_path

    def export_docx(self, project_id: str, report_type: str = "assessment") -> Path:
        """Generates a Microsoft Word (.docx) assessment document."""
        p = get_project_by_id(project_id)
        if not p:
            raise ValueError(f"Project {project_id} not found")

        out_path = settings.REPORTS_DIR / f"{p['id']}_{report_type}_report.docx"
        doc = docx.Document()

        title = doc.add_heading(f"SHU ORIC – {p['id']}: {report_type.upper()} REPORT", level=0)
        title.style.font.color.rgb = RGBColor(10, 37, 64)

        p_meta = doc.add_paragraph()
        p_meta.add_run("Salim Habib University, Karachi | Office of Research, Innovation & Commercialization\n").bold = True
        p_meta.add_run(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

        doc.add_heading("1. Project Title & Details", level=1)
        doc.add_paragraph(f"Title: {p['title']}")
        doc.add_paragraph(f"Faculty PI: {p.get('facultyPI', 'N/A')}")
        doc.add_paragraph(f"Course: {p.get('courseCode', '')} - {p.get('courseTitle', '')}")
        doc.add_paragraph(f"Domain: {p.get('domain', 'N/A')}")

        doc.add_heading("2. Executive Abstract", level=1)
        doc.add_paragraph(p.get("abstract", ""))

        doc.add_heading("3. Commercial Assessment & Sizing", level=1)
        comm = p.get("commercialization", {})
        market = p.get("marketSizing", {})
        doc.add_paragraph(f"TRL Status: {comm.get('trlDescription', '')}")
        doc.add_paragraph(f"Commercial Recommendation: {comm.get('recommendation', '')}")
        doc.add_paragraph(f"TAM (PKR): {market.get('tamPKR', 'N/A')} Million")
        doc.add_paragraph(f"SOM (PKR): {market.get('somPKR', 'N/A')} Million")

        doc.save(str(out_path))
        return out_path

    def export_xlsx(self, project_id: str) -> Path:
        """Generates an Excel (.xlsx) financial & forecasting model workbook."""
        p = get_project_by_id(project_id)
        if not p:
            raise ValueError(f"Project {project_id} not found")

        out_path = settings.REPORTS_DIR / f"{p['id']}_forecast_model.xlsx"
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Financial Forecast"

        ws.append(["SALIM HABIB UNIVERSITY - ORIC FINANCIAL & FORECASTING MODEL"])
        ws.append(["Project ID", p["id"]])
        ws.append(["Project Title", p["title"]])
        ws.append(["Faculty PI", p.get("facultyPI", "")])
        ws.append([])

        ws.append(["Year", "Conservative (PKR M)", "Expected (PKR M)", "Optimistic (PKR M)", "Unit Sales Est."])

        # Add forecast rows
        growth = p.get("growthForecast", {}).get("forecastTable", [])
        if growth:
            for row in growth:
                ws.append([
                    row.get("year"),
                    row.get("lowPKR"),
                    row.get("basePKR"),
                    row.get("highPKR"),
                    row.get("unitSalesEst")
                ])
        else:
            base = p.get("marketSizing", {}).get("somPKR", 300)
            for i, yr in enumerate(range(2026, 2032)):
                ws.append([yr, round(base * (1.07 ** i), 1), round(base * (1.11 ** i), 1), round(base * (1.15 ** i), 1), int(base * 10000 * (1.1 ** i))])

        wb.save(str(out_path))
        return out_path

report_exporter = ReportExporter()
