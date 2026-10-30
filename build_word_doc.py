import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_document():
    doc = docx.Document()

    # Set page margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)
        
        # Header & Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("SALIM HABIB UNIVERSITY (SHU) | ORIC AI ECOSYSTEM")
        hrun.font.name = "Calibri"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(148, 163, 184) # Slate 400

        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        frun = fp.add_run("SHU ORIC AI – 100% Greenfield Master Blueprint | Confidential")
        frun.font.name = "Calibri"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(148, 163, 184)

    # Color Palette
    C_NAVY = "0A2540"      # Brand Deep Navy
    C_GOLD = "C59B27"      # Brand Gold Accent
    C_SLATE_DARK = "1E293B"# Dark Slate
    C_SLATE_LIGHT = "F8FAFC"# Light table background
    C_CALLOUT_BG = "F1F5F9" # Light gray fill
    C_BORDER = "CBD5E1"    # Gray border
    C_RED_BG = "FEF2F2"    # Red warning fill
    C_RED_BORDER = "EF4444"# Red warning border
    C_GREEN_BG = "F0FDF4"  # Green success fill
    C_GREEN_BORDER = "22C55E"# Green success border

    def set_cell_shading(cell, color_hex):
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
        cell._tc.get_or_add_tcPr().append(shading)

    def set_cell_margins(cell, top=140, bottom=140, left=200, right=200):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)

    def set_table_borders(table, color="CBD5E1"):
        tblPr = table._tbl.tblPr
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
            f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
            f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
            f'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
            f'<w:left w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'</w:tblBorders>'
        )
        tblPr.append(borders)

    def add_callout(text, title=None, border_color=C_NAVY, bg_color=C_CALLOUT_BG):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        tbl.columns[0].width = Inches(6.8)
        cell = tbl.cell(0, 0)
        set_cell_shading(cell, bg_color)
        set_cell_margins(cell, top=140, bottom=140, left=220, right=200)

        # Left border only
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'<w:left w:val="single" w:sz="28" w:space="0" w:color="{border_color}"/>'
            f'<w:top w:val="none"/>'
            f'<w:bottom w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(borders)

        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        if title:
            trun = p.add_run(title + "\n")
            trun.bold = True
            trun.font.name = "Calibri"
            trun.font.size = Pt(11)
            trun.font.color.rgb = RGBColor(10, 37, 64) if border_color == C_NAVY else RGBColor(185, 28, 28)

        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(10)
        run.font.color.rgb = RGBColor(30, 41, 59)

        # Empty spacing paragraph after callout
        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(0)
        sp.paragraph_format.space_after = Pt(4)

    def add_audit_box(feature_name, problem_text, fix_text):
        tbl = doc.add_table(rows=2, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        tbl.columns[0].width = Inches(6.8)

        # Row 1: Problem
        c1 = tbl.cell(0, 0)
        set_cell_shading(c1, C_RED_BG)
        set_cell_margins(c1, top=120, bottom=120, left=200, right=200)
        b1 = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{C_RED_BORDER}"/>'
            f'<w:top w:val="single" w:sz="4" w:space="0" w:color="{C_BORDER}"/>'
            f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="{C_BORDER}"/>'
            f'<w:right w:val="single" w:sz="4" w:space="0" w:color="{C_BORDER}"/>'
            f'</w:tcBorders>'
        )
        c1._tc.get_or_add_tcPr().append(b1)
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(2)
        p1.paragraph_format.space_after = Pt(2)
        p1.paragraph_format.line_spacing = 1.15
        r1_title = p1.add_run(f"❌ STATIC FLAW: {feature_name}\n")
        r1_title.bold = True
        r1_title.font.name = "Calibri"
        r1_title.font.size = Pt(10.5)
        r1_title.font.color.rgb = RGBColor(185, 28, 28) # Red 700
        r1_body = p1.add_run(problem_text)
        r1_body.font.name = "Calibri"
        r1_body.font.size = Pt(9.5)
        r1_body.font.color.rgb = RGBColor(69, 10, 10)

        # Row 2: Greenfield Fix
        c2 = tbl.cell(1, 0)
        set_cell_shading(c2, C_GREEN_BG)
        set_cell_margins(c2, top=120, bottom=120, left=200, right=200)
        b2 = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{C_GREEN_BORDER}"/>'
            f'<w:top w:val="none"/>'
            f'<w:bottom w:val="single" w:sz="8" w:space="0" w:color="{C_GREEN_BORDER}"/>'
            f'<w:right w:val="single" w:sz="4" w:space="0" w:color="{C_BORDER}"/>'
            f'</w:tcBorders>'
        )
        c2._tc.get_or_add_tcPr().append(b2)
        p2 = c2.paragraphs[0]
        p2.paragraph_format.space_before = Pt(2)
        p2.paragraph_format.space_after = Pt(2)
        p2.paragraph_format.line_spacing = 1.15
        r2_title = p2.add_run("✅ GREENFIELD FIX (BUILDING FROM SCRATCH):\n")
        r2_title.bold = True
        r2_title.font.name = "Calibri"
        r2_title.font.size = Pt(10.5)
        r2_title.font.color.rgb = RGBColor(21, 128, 61) # Green 700
        r2_body = p2.add_run(fix_text)
        r2_body.font.name = "Calibri"
        r2_body.font.size = Pt(9.5)
        r2_body.font.color.rgb = RGBColor(20, 83, 45)

        # Spacing
        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(0)
        sp.paragraph_format.space_after = Pt(4)

    def add_h1(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(18)
        h.paragraph_format.space_after = Pt(6)
        h.paragraph_format.keep_with_next = True
        run = h.add_run(text)
        run.bold = True
        run.font.name = "Calibri"
        run.font.size = Pt(16)
        run.font.color.rgb = RGBColor(10, 37, 64)
        return h

    def add_h2(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(4)
        h.paragraph_format.keep_with_next = True
        run = h.add_run(text)
        run.bold = True
        run.font.name = "Calibri"
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(197, 155, 39) # Gold
        return h

    def add_h3(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(8)
        h.paragraph_format.space_after = Pt(2)
        h.paragraph_format.keep_with_next = True
        run = h.add_run(text)
        run.bold = True
        run.font.name = "Calibri"
        run.font.size = Pt(11)
        run.font.color.rgb = RGBColor(30, 41, 59)
        return h

    def add_p(text, bold_prefix=None, space_after=5):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            br = p.add_run(bold_prefix)
            br.bold = True
            br.font.name = "Calibri"
            br.font.size = Pt(10.5)
            br.font.color.rgb = RGBColor(15, 23, 42)
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(10.5)
        run.font.color.rgb = RGBColor(51, 65, 85)
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            br = p.add_run(bold_prefix)
            br.bold = True
            br.font.name = "Calibri"
            br.font.size = Pt(10)
            br.font.color.rgb = RGBColor(15, 23, 42)
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(10)
        run.font.color.rgb = RGBColor(51, 65, 85)
        return p

    # ==========================
    # DOCUMENT COVER / TITLE
    # ==========================
    p_badge = doc.add_paragraph()
    p_badge.paragraph_format.space_before = Pt(0)
    p_badge.paragraph_format.space_after = Pt(4)
    r_badge = p_badge.add_run("OFFICE OF RESEARCH, INNOVATION & COMMERCIALIZATION (ORIC)")
    r_badge.font.name = "Calibri"
    r_badge.font.size = Pt(9.5)
    r_badge.bold = True
    r_badge.font.color.rgb = RGBColor(197, 155, 39)

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    r_title = p_title.add_run("SHU ORIC AI Ecosystem – Greenfield Master Blueprint")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(22)
    r_title.bold = True
    r_title.font.color.rgb = RGBColor(10, 37, 64)

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(14)
    r_sub = p_sub.add_run("Plain-English System Overview, Technical Architecture & Comprehensive Static-to-Dynamic Audit")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(12)
    r_sub.font.color.rgb = RGBColor(100, 116, 139)

    add_callout(
        "CRITICAL ARCHITECTURAL DIRECTIVE: We are building the SHU ORIC AI platform 100% FROM SCRATCH (Greenfield Development). All legacy assumptions regarding web scrapers, scraping oric-shu.vercel.app, hardcoded JSON files, and static prompt strings are permanently discarded. Every piece of code, database schema, AI orchestration, and user interface is being engineered from ground zero.",
        title="EXECUTIVE GREENFIELD MANDATE",
        border_color=C_NAVY
    )

    # ==========================================
    # SECTION 1: WHAT IS SHU ORIC AI?
    # ==========================================
    add_h1("1. What Are We Actually Building? (In Plain Terms)")
    add_p(
        "At Salim Habib University (SHU), valuable faculty research and student final-year projects frequently sit locked in paper reports, static PDFs, or buried on an outdated website. Meanwhile, across Karachi's booming manufacturing zones—Korangi, S.I.T.E., Landhi, Port Qasim, and Federal B Area—hundreds of industrial plants, pharmaceutical factories, and textile mills face technical problems that they cannot solve alone."
    )
    add_p(
        "SHU ORIC AI is the university's digital commercialization bridge. It does three essential things:"
    )
    add_bullet("Collects and deeply understands all university innovations across Pharmacy, Computer Science, Biomedical Engineering, and Management Sciences.", "1. Centralizes Research: ")
    add_bullet("Actively searches and monitors live corporate demands, supply chain shortages, and industrial problems across Karachi, Pakistan, and regional GCC markets.", "2. Scans Industry: ")
    add_bullet("Matches university research to matching companies, scores how ready a project is for investment, and generates formal pitch decks, feasibility reports, and partnership MoUs.", "3. Bridges Commercialization: ")

    # ==========================================
    # SECTION 2: WHY BUILD FROM SCRATCH?
    # ==========================================
    add_h1("2. Why We Must Build 100% From Scratch (The Fatal Flaws of Legacy)")
    add_p(
        "The previous prototype attempted to audit and scrape an existing website (oric-shu.vercel.app) while loading hardcoded JSON files (such as raw_projects.json). In enterprise software engineering, this approach fails immediately:"
    )
    add_bullet("Web scrapers break the second a developer renames a CSS class or redesigns a webpage, causing silent data corruption.", "• Scrapers Are Fragile: ")
    add_bullet("A static JSON file cannot accept new semester submissions, faculty edits, or patent filings. A real university requires an active relational database with strict validation.", "• No Dynamic Updates: ")
    add_bullet("Hardcoded Python bot prompts require a developer to redeploy backend servers every time a professor wants to change a teaching tone or add a research guideline.", "• Inflexible Bot Logic: ")
    add_bullet("Flat files cannot run high-speed vector similarity searches. A modern AI needs pgvector indexing to read multi-page research papers in milliseconds.", "• No Vector Search: ")

    # ==========================================
    # SECTION 3: COMPREHENSIVE STATIC-TO-DYNAMIC AUDIT
    # ==========================================
    add_h1("3. Comprehensive Audit: What is Static & Exactly What Must Be Fixed")
    add_p(
        "Below is the complete, meticulous audit of every element in the specification that was previously hardcoded or static, along with the exact greenfield replacement engineered to fix it:"
    )

    add_audit_box(
        "1. Static Project & Faculty Data",
        "The legacy codebase loaded static project arrays from raw_projects.json or attempted to scrape oric-shu.vercel.app. Faculty lists and department assignments were hardcoded in Python dictionaries. New research, student thesis updates, and patent changes could not be added without editing source code.",
        "Engineered Dynamic Solution:\n"
        "1. Dynamic PostgreSQL Schemas: Build relational tables for faculties, departments, users, and projects with foreign-key referential integrity.\n"
        "2. Automated Document Ingestion Pipeline: Build drag-and-drop file uploaders accepting PDF, Word (.docx), and Excel (.xlsx). PyMuPDF and python-docx extract text, structured tables, and metadata automatically.\n"
        "3. pgvector Semantic Search: Every uploaded paper is automatically chunked and converted into 1536-dimensional vector embeddings, allowing the AI to search through 50-page dissertations instantly.\n"
        "4. Web Admin Portal: ORIC staff and faculty log into a clean CRUD dashboard to add, edit, approve, or archive projects in real time."
    )

    add_audit_box(
        "2. Static Industrial & Geographic Radar",
        "The old design hardcoded static lists of Karachi industrial clusters (Korangi Industrial Area, S.I.T.E., Landhi) and an arbitrary list of local companies. This data becomes obsolete in months, cannot find newly incorporated companies, and fails completely when expanding to Lahore, Faisalabad, or the Gulf (UAE, Saudi Arabia).",
        "Engineered Dynamic Solution:\n"
        "1. Live External Search Engine: Connect real-time search APIs (Tavily Search API / Google Custom Search) directly to the AI agent.\n"
        "2. Dynamic Company Knowledge Store: A PostgreSQL table (industry_partners) that records verified corporate entities, business activities, technical pain points, and decision-maker contact details.\n"
        "3. Automated Enrichment Worker: When an ORIC officer asks for 'Active Pharmaceutical Ingredient manufacturers in Sindh', the AI queries live corporate registries (SECP, PSX), verifies current operational status, and matches them to SHU lab capabilities."
    )

    add_audit_box(
        "3. Static Virtual Teachers & Bot Prompts",
        "Bot personalities, teaching prompts, and behavioral instructions were previously hardcoded as static string variables inside Python files (orchestrator.py). Changing an AI teacher's tone, adding bilingual Urdu rules, or modifying domain guidelines required code redeployment.",
        "Engineered Dynamic Solution:\n"
        "1. Database-Backed Persona Engine: Store all personas in an ai_agent_personas database table (name, slug, department, system prompt, temperature, preferred LLM model, knowledge filter tags).\n"
        "2. Admin Persona Studio: Deans and ORIC administrators can create new Virtual Teachers (e.g. 'Dr. Farooq – Senior Pharmaceutics Mentor', 'Prof. Aisha – Computer Vision Specialist') and adjust their prompt instructions on the fly from a browser settings page.\n"
        "3. Prompt Versioning & Rollback: Every prompt modification is archived in a prompt_versions table with author audit trails and instant one-click rollback if response quality drops."
    )

    add_audit_box(
        "4. Static ERL & Readiness Scoring",
        "Entrepreneurship Readiness Level (ERL) was computed using rigid, hardcoded checklists or fixed Python math formulas. If the Higher Education Commission (HEC) of Pakistan updates university commercialization standards, the system hardcoded logic becomes invalid.",
        "Engineered Dynamic Solution:\n"
        "1. Configurable Evaluation Canvas DB Schema: Rubrics are stored as dynamic JSON in erl_rubrics. Admins can customize the 8 readiness dimensions (Learning, Innovation, Team, Market, Technology, Business Model, IP, and Funding), change weights, and define custom question prompts.\n"
        "2. Dynamic Evaluation Engine: The ERL Assessment Agent reads the active rubric at runtime, evaluates project documents, calculates scores dynamically, and plots interactive radar/spider charts.\n"
        "3. Actionable Milestone Tracker: Converts identified commercialization gaps into active milestone checklist records in PostgreSQL that researchers check off as they file patents or validate lab prototypes."
    )

    add_audit_box(
        "5. Static Voice & Interaction Interface",
        "The legacy interface had no real voice integration or relied on mock audio elements. Chat was single-turn without token streaming, resulting in clunky UI freezes while waiting for long LLM responses.",
        "Engineered Dynamic Solution:\n"
        "1. Real-Time WebSockets: Replaced HTTP polling with bidirectional WebSockets (/api/v1/ws/chat) that stream words to the user interface in real time with zero perceived latency.\n"
        "2. Native Web Speech API & WebRTC: Microphone button captures live speech; browser-native speech recognition transcribes words immediately with zero extra server costs.\n"
        "3. Bilingual & Urdu Code-Switching: System natively handles English, Urdu, and conversational bilingual mixed phrases ('Urdu-English') common in Pakistani academic institutions."
    )

    add_audit_box(
        "6. Static Meeting Discussions & Transcription",
        "Research consultations, ORIC advisory sessions, and industry meetings previously had no recording capabilities or only showed fake placeholder transcript text.",
        "Engineered Dynamic Solution:\n"
        "1. Built-in Audio Recorder: Browser-based WebRTC recorder with explicit consent checkboxes and recording status indicators.\n"
        "2. Live Speech-to-Text & Diarization: Transcribes spoken discussions into clean text with speaker identification.\n"
        "3. Automated Intelligence Extraction: Background AI extracts executive summaries, agreed decisions, and concrete action items.\n"
        "4. One-Click Document Export: Transcripts and action matrices export directly to publication-ready PDF, Word (.docx), and text formats, automatically attached to the relevant project profile."
    )

    add_audit_box(
        "7. Static Executive Leadership Dashboard",
        "The previous executive screen showed mock statistics, hardcoded project counts, and static bar charts that had no connection to actual university reality.",
        "Engineered Dynamic Solution:\n"
        "1. Real-Time Aggregated SQL Metrics: The dashboard computes live statistics directly from the PostgreSQL database (total active projects, faculty distribution, patent pipelines, commercial readiness stages).\n"
        "2. Strategic C-Level Querying: Vice Chancellors and Deans can type strategic questions (e.g. 'Which 5 biomedical projects have the highest commercial potential this quarter?') and receive instant, data-backed reports.\n"
        "3. One-Click Portfolio Dossier: Automatically compiles a university-wide innovation summary into an editable Microsoft Word or PDF report for board meetings."
    )

    # ==========================================
    # SECTION 4: THE 8 CORE MODULES
    # ==========================================
    add_h1("4. The 8 Core Modules Explained (Plain English)")
    add_p(
        "The entire platform is organized into eight clear, modular components:"
    )

    modules = [
        ("1. Core Chatbot & Virtual Teachers", "A dual-mode conversational assistant. Users can toggle between 'Conversational Mode' (casual mentoring) and 'Research Mode' (rigorous, citation-backed deep dives). Supports dynamic teacher personas tailored to Pharmacy, IT, or Business."),
        ("2. Project Intelligence Engine (PIE)", "The university's central IP vault. Automatically ingests, indexes, and understands every paper, thesis, and prototype. Strictly governed by non-hallucination guardrails: if project data is missing, it flags the gap instead of guessing."),
        ("3. The 11 Specialized AI Agents", "A team of focused AI workers managed by a central dispatcher: Project Agent, Science Agent, Web Agent, Business Agent, Industry Agent, Finance Agent, Forecasting Agent, ERL Agent, Opportunity Agent, Executive Agent, and Report Generator."),
        ("4. Knowledge Graph", "A visual interactive map connecting university projects, technologies, faculty expertise, and industrial sectors. Enables multi-hop discovery (e.g. connecting a Computer Science AI model with a Pharmacy drug delivery experiment)."),
        ("5. Karachi Industry Radar", "Proactive industrial search engine monitoring Karachi clusters (Korangi, SITE, Landhi, Port Qasim, FB Area) and Pakistani chambers of commerce to identify corporate R&D needs."),
        ("6. ERL Assessment Framework", "An 8-dimension commercial readiness scorer (Learning, Innovation, Team, Market, Tech, Business Model, IP, and Funding) providing gap analysis and milestone checklists."),
        ("7. Discussion Recorder & Transcriber", "A secure meeting tool that records audio, transcribes live speech, extracts key decisions and action items, and attaches them to project profiles."),
        ("8. Executive Intelligence Dashboard", "A high-level command center for the Vice Chancellor and Deans showing portfolio readiness, patent pipelines, and strategic investment guidance.")
    ]

    for title, desc in modules:
        add_p(desc, bold_prefix=title + ": ")

    # ==========================================
    # SECTION 5: TECH STACK
    # ==========================================
    add_h1("5. The Greenfield Tech Stack (Simple & Clean)")
    add_p(
        "We have selected a battle-tested, high-performance stack with zero unnecessary complexity:"
    )

    tbl_stack = doc.add_table(rows=6, cols=3)
    tbl_stack.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_stack.autofit = False
    set_table_borders(tbl_stack)

    stack_widths = [Inches(1.8), Inches(2.0), Inches(3.0)]
    stack_headers = ["Layer", "Technology", "Role in Greenfield Architecture"]
    for i, h in enumerate(stack_headers):
        cell = tbl_stack.cell(0, i)
        cell.width = stack_widths[i]
        set_cell_shading(cell, C_NAVY)
        set_cell_margins(cell, top=140, bottom=140, left=150, right=150)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(255, 255, 255)

    stack_data = [
        ("Frontend Web App", "Next.js 14+ & Tailwind CSS", "Modern React App Router, clean SHU brand styling, Cytoscape.js graphs, and voice buttons."),
        ("Backend API", "FastAPI (Python 3.12+)", "High-speed asynchronous Python framework, native WebSockets for streaming chat, and strict Pydantic validation."),
        ("Primary Database", "PostgreSQL 16 + pgvector", "One single database for user logins, project records, audit logs, and AI vector similarity search."),
        ("Cache & Sessions", "Redis 7 (Alpine)", "Sub-millisecond caching for session states, rate limiting, and real-time chat pub/sub message brokering."),
        ("Multi-LLM Brains", "Gemini 1.5 + GPT-4o + Claude", "Gemini 1.5 for large paper context; GPT-4o for JSON data; Claude 3.5 Sonnet for formal feasibility reports.")
    ]

    for row_idx, data in enumerate(stack_data, start=1):
        bg = C_SLATE_LIGHT if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate(data):
            cell = tbl_stack.cell(row_idx, col_idx)
            cell.width = stack_widths[col_idx]
            set_cell_shading(cell, bg)
            set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            r = p.add_run(text)
            r.font.name = "Calibri"
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor(30, 41, 59)
            if col_idx == 0:
                r.bold = True

    sp = doc.add_paragraph()
    sp.paragraph_format.space_after = Pt(4)

    # ==========================================
    # SECTION 6: 6-STEP ROADMAP
    # ==========================================
    add_h1("6. The 6-Step Implementation Roadmap")
    add_p(
        "Here is the realistic, zero-to-one engineering schedule to build the complete ecosystem:"
    )

    steps = [
        ("Phase 1: Core Foundation & Database (Weeks 1-2)", "Set up Docker containers (PostgreSQL 16 + pgvector, Redis), create clean Alembic database migrations, configure user logins and roles, and build the Multi-LLM provider client."),
        ("Phase 2: Dynamic Document Ingestion & Knowledge Graph (Weeks 3-4)", "Build drag-and-drop file upload endpoints for PDFs and Word docs, write the automated vector chunking pipeline, and build the Knowledge Graph relational tables."),
        ("Phase 3: Multi-Agent Orchestrator & Conversational AI (Weeks 5-6)", "Implement the central agent router, connect WebSockets for real-time word streaming, add the microphone voice interface, and build the dynamic Virtual Teachers studio."),
        ("Phase 4: Specialized Intelligence Engines (Weeks 7-8)", "Build the Karachi Industry Radar with live web search, write the Opportunity Discovery bipartite matching engine, and implement the configurable ERL Assessment canvas."),
        ("Phase 5: Executive Dashboard, Discussion Recorder & Reports (Weeks 9-10)", "Build the meeting audio recorder with speech-to-text, implement the C-level executive dashboard, and create the automated PDF/Word report generation engine."),
        ("Phase 6: Testing, Security Hardening & Deployment (Weeks 11-12)", "Perform penetration testing, prompt injection protection, document ACL checks, and containerize the entire application for cloud deployment.")
    ]

    for title, desc in steps:
        add_p(desc, bold_prefix=title + ": ")

    # ==========================================
    # SECTION 7: CORE DATABASE SCHEMAS
    # ==========================================
    add_h1("7. The Core Database Tables (Plain Schema Breakdown)")
    add_p(
        "Instead of complex or fragmented databases, the greenfield architecture is organized around seven clean PostgreSQL tables:"
    )

    tables_info = [
        ("1. users & roles", "Stores user accounts, hashed passwords, departmental affiliations, and granular permissions (Super Admin, ORIC Admin, Faculty, Student)."),
        ("2. faculties & departments", "Hierarchical structure representing Pharmacy, Computer Science, Engineering, and Management Sciences."),
        ("3. projects", "The master project repository containing title, abstract, problem statement, technology stack, development stage, TRL/ERL scores, and IP filing status."),
        ("4. document_chunks (pgvector)", "Stores split paragraphs of uploaded research papers along with 1536-dimensional vector embeddings for AI semantic search."),
        ("5. ai_agent_personas", "Dynamic Virtual Teachers and ORIC advisors: stores system prompt instructions, pedagogical tone, model parameters, and domain filters."),
        ("6. erl_rubrics & erl_assessments", "Stores configurable 8-dimension readiness rubrics, evaluation histories, gap analysis, and completed milestones."),
        ("7. discussion_transcripts", "Stores meeting audio file references, full speech-to-text transcripts, AI summaries, decisions made, and assigned action items.")
    ]

    for title, desc in tables_info:
        add_bullet(desc, bold_prefix=title + ": ")

    # ==========================================
    # SECTION 8: SPRINT ZERO ACTION ITEMS
    # ==========================================
    add_h1("8. Sprint Zero Immediate Action Items")
    add_p(
        "To kick off development immediately, here are the first concrete engineering tasks:"
    )

    add_bullet("Create docker-compose.yml defining PostgreSQL 16 (pgvector/pgvector:pg16), Redis 7, and FastAPI.", "Task 1 (Docker Setup): ")
    add_bullet("Configure the FastAPI application with async SQLAlchemy 2.0 and write initial Alembic migrations for users, faculties, and projects.", "Task 2 (Database Migrations): ")
    add_bullet("Write the Multi-LLM Gateway class routing between Gemini 1.5, GPT-4o, and Claude with token streaming.", "Task 3 (AI Gateway): ")
    add_bullet("Scaffold Next.js 14+ with Tailwind CSS, SHU brand colors (Navy #0A2540, Gold #C59B27), and the left navigation panel.", "Task 4 (Frontend Shell): ")
    add_bullet("Implement the PyMuPDF/python-docx text extraction and pgvector chunking sandbox.", "Task 5 (File Ingestion): ")

    # Save document
    output_path = os.path.abspath("PROJECT_OVERVIEW.docx")
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    create_document()

