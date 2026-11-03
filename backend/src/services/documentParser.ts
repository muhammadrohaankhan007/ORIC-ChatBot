import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import XLSX from 'xlsx';

export interface DocumentChunk {
  index: number;
  content: string;
}

export interface ParsedProject {
  id: string;
  project_code: string;
  title: string;
  faculty: string;
  faculty_code: 'FOP' | 'FCS' | 'FE' | 'FMS';
  department: string;
  lead_investigator: string;
  abstract: string;
  problem_statement: string;
  technology_stack: string[];
  development_stage: 'Concept' | 'Lab Prototype' | 'Bench Validated' | 'Field Tested' | 'Commercial Ready';
  trl_level: number;
  erl_level: number;
  ip_status: 'None' | 'Disclosure Filed' | 'Patent Pending' | 'Patent Granted';
  target_industries: string[];
  commercial_readiness: 'High' | 'Medium' | 'Emerging';
  estimated_funding_pkr: number;
  created_at: string;
}

export class DocumentParser {
  /**
   * Extract plain text from PDF or DOCX buffer
   */
  static async extractText(buffer: Buffer, mimetype: string, originalname: string): Promise<string> {
    const ext = originalname.toLowerCase().split('.').pop();

    if (mimetype === 'application/pdf' || ext === 'pdf') {
      const data = await pdfParse(buffer);
      return data.text || '';
    }

    if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      ext === 'docx'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    }

    // Default to utf-8 string if text or unknown
    return buffer.toString('utf-8');
  }

  /**
   * Split document text into overlapping chunks
   */
  static chunkText(text: string, chunkSize = 800, chunkOverlap = 150): DocumentChunk[] {
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
    if (!cleanText) return [];

    const chunks: DocumentChunk[] = [];
    let start = 0;
    let index = 0;

    while (start < cleanText.length) {
      const end = Math.min(start + chunkSize, cleanText.length);
      const chunk = cleanText.substring(start, end).trim();

      if (chunk.length > 30) {
        chunks.push({
          index,
          content: chunk
        });
        index++;
      }

      start += chunkSize - chunkOverlap;
    }

    return chunks;
  }

  /**
   * Extract structured research projects from an uploaded Excel (.xlsx, .xls, .csv) file
   */
  static parseProjectsFromExcel(buffer: Buffer): ParsedProject[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const parsedProjects: ParsedProject[] = [];
    const seenTitles = new Set<string>();

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
      if (!Array.isArray(rows) || rows.length === 0) continue;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || typeof row !== 'object') continue;

        // Find Title
        const rawTitle =
          row['Project Name'] ||
          row['Project Title'] ||
          row['Title'] ||
          row['Project'] ||
          row['Topic'] ||
          row['Research Title'] ||
          row['Name'] ||
          '';

        if (!rawTitle || typeof rawTitle !== 'string' || rawTitle.trim().length < 4) continue;

        // Clean title: remove "Project 01- " prefixes
        const title = rawTitle
          .replace(/^project\s*\d+\s*[-:]\s*/i, '')
          .replace(/^topic\s*\d+\s*[-:]\s*/i, '')
          .trim();

        if (seenTitles.has(title.toLowerCase())) continue;
        seenTitles.add(title.toLowerCase());

        // Find Abstract
        const rawAbstract =
          row['Project Abstract'] ||
          row['Abstract'] ||
          row['Description'] ||
          row['Project Objectives'] ||
          row['Objectives'] ||
          row['Summary'] ||
          row['Details'] ||
          `Research investigation into ${title} conducted at Salim Habib University.`;

        // Find Lead / Supervisor
        const rawSupervisor =
          row['Teacher'] ||
          row['Supervisor'] ||
          row['Lead Investigator'] ||
          row['PI'] ||
          row['Faculty Member'] ||
          row['Instructor'] ||
          row['Author'] ||
          row['Lead'] ||
          'Faculty Supervisor';

        const supervisor = String(rawSupervisor)
          .replace(/\s+\d+$/, '') // strip employee id numbers
          .trim();

        const leadInvestigator = supervisor.startsWith('Dr.') || supervisor.startsWith('Prof.')
          ? supervisor
          : `Dr. ${supervisor}`;

        // Find Department & Course
        const courseTitle =
          row['Course Title'] ||
          row['Department'] ||
          row['Course'] ||
          row['Discipline'] ||
          row['Subject'] ||
          'Pharmaceutics';

        // Detect Faculty Code
        const combinedContext = `${courseTitle} ${title} ${rawAbstract}`.toLowerCase();
        let faculty = 'Faculty of Pharmacy';
        let faculty_code: 'FOP' | 'FCS' | 'FE' | 'FMS' = 'FOP';
        let targetIndustries = ['Pharmaceuticals', 'Clinical Research', 'Biotechnology'];

        if (
          combinedContext.includes('comput') ||
          combinedContext.includes('software') ||
          combinedContext.includes('ai') ||
          combinedContext.includes('vision') ||
          combinedContext.includes('machine learning')
        ) {
          faculty = 'Faculty of Information Technology';
          faculty_code = 'FCS';
          targetIndustries = ['Information Technology', 'Software & AI', 'Enterprise Systems'];
        } else if (
          combinedContext.includes('bio-med') ||
          combinedContext.includes('biomedical') ||
          combinedContext.includes('sensor') ||
          combinedContext.includes('device') ||
          combinedContext.includes('instrument')
        ) {
          faculty = 'Faculty of Engineering';
          faculty_code = 'FE';
          targetIndustries = ['Medical Devices', 'Healthcare Instrumentation', 'Biomedical Sensors'];
        } else if (
          combinedContext.includes('supply chain') ||
          combinedContext.includes('esg') ||
          combinedContext.includes('finance') ||
          combinedContext.includes('market') ||
          combinedContext.includes('business')
        ) {
          faculty = 'Faculty of Management Sciences';
          faculty_code = 'FMS';
          targetIndustries = ['Logistics & Supply Chain', 'Export Industries', 'Manufacturing'];
        }

        // Code
        const rawCode = row['Course Code'] || row['Project Code'] || row['Code'] || row['Class Nbr'] || '';
        const project_code = rawCode
          ? String(rawCode).split(' ')[0]
          : `SHU-${faculty_code}-2026-${String(parsedProjects.length + 1).padStart(3, '0')}`;

        // Technical stack
        let techStack: string[] = [];
        if (row['Technical Stack'] || row['Technology Stack'] || row['Technologies']) {
          const raw = String(row['Technical Stack'] || row['Technology Stack'] || row['Technologies']);
          techStack = raw.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
        }
        if (techStack.length === 0) {
          if (faculty_code === 'FOP') {
            techStack = ['Formulation Science', 'HPLC Assay', 'Dissolution Testing', 'Stability Protocols'];
          } else if (faculty_code === 'FCS') {
            techStack = ['Python', 'Machine Learning', 'TensorFlow', 'REST API'];
          } else if (faculty_code === 'FE') {
            techStack = ['Bio-Instrumentation', 'Embedded Microcontrollers', 'Signal Processing'];
          } else {
            techStack = ['Enterprise Analytics', 'Process Optimization', 'Economic Feasibility'];
          }
        }

        // TRL / ERL
        const trl = typeof row['TRL'] === 'number' ? Math.min(9, Math.max(1, row['TRL'])) : (3 + (i % 4));
        const erl = typeof row['ERL'] === 'number' ? Math.min(9, Math.max(1, row['ERL'])) : (4 + (i % 3));

        parsedProjects.push({
          id: `proj-up-${Date.now()}-${i + 1}`,
          project_code,
          title,
          faculty,
          faculty_code,
          department: String(courseTitle).trim(),
          lead_investigator: leadInvestigator,
          abstract: String(rawAbstract).trim(),
          problem_statement: `Addresses critical industrial and healthcare challenges in ${courseTitle} through empirical laboratory validation.`,
          technology_stack: techStack,
          development_stage: trl >= 6 ? 'Bench Validated' : 'Lab Prototype',
          trl_level: trl,
          erl_level: erl,
          ip_status: trl >= 5 ? 'Disclosure Filed' : 'None',
          target_industries: targetIndustries,
          commercial_readiness: trl >= 5 ? 'High' : 'Medium',
          estimated_funding_pkr: 1200000 + (i % 5) * 400000,
          created_at: new Date().toISOString()
        });
      }
    }

    return parsedProjects;
  }

  /**
   * Extract structured research projects from an uploaded Word (.docx, .doc) file
   */
  static async parseProjectsFromWord(buffer: Buffer, originalName: string): Promise<ParsedProject[]> {
    const result = await mammoth.extractRawText({ buffer });
    const fullText = (result.value || '').trim();

    if (!fullText) {
      throw new Error('Word document contains no readable text.');
    }

    const projects: ParsedProject[] = [];
    const baseName = originalName.replace(/\.[^/.]+$/, '').trim();

    // Check if document contains multiple projects delimited by headings
    const projectSections = fullText.split(/(?=(?:^|\n)(?:Project\s+\d+|###\s+Project|\bProject\s+Title:))/i);

    if (projectSections.length > 1) {
      for (let idx = 0; idx < projectSections.length; idx++) {
        const section = projectSections[idx].trim();
        if (section.length < 40) continue;
        const p = this.extractProjectFromText(section, `${baseName} - Part ${idx + 1}`, idx);
        if (p) projects.push(p);
      }
    }

    // If single project document
    if (projects.length === 0) {
      const p = this.extractProjectFromText(fullText, baseName, 0);
      if (p) projects.push(p);
    }

    return projects;
  }

  /**
   * Helper to parse project attributes from textual blocks
   */
  static extractProjectFromText(text: string, defaultTitle: string, index: number): ParsedProject | null {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    const titleMatch = text.match(/(?:Project\s*Title|Title|Topic|Research\s*Title)\s*[:\-]\s*([^\n\r]+)/i);
    const supervisorMatch = text.match(/(?:Supervisor|Lead\s*Investigator|Principal\s*Investigator|PI|Teacher|Author)\s*[:\-]\s*([^\n\r]+)/i);
    const departmentMatch = text.match(/(?:Department|Course|Discipline|Subject)\s*[:\-]\s*([^\n\r]+)/i);
    const abstractMatch = text.match(/(?:Abstract|Project\s*Abstract|Description|Summary|Overview)\s*[:\-]\s*([\s\S]+?)(?=\n\s*(?:Objectives|Methodology|Technologies|Keywords|References|$))/i);
    const techMatch = text.match(/(?:Technologies|Technology\s*Stack|Technical\s*Stack|Keywords|Methodology)\s*[:\-]\s*([^\n\r]+)/i);

    const title = titleMatch ? titleMatch[1].trim() : (lines[0].length < 120 ? lines[0] : defaultTitle);
    const supervisor = supervisorMatch ? supervisorMatch[1].trim() : 'Faculty Investigator';
    const lead_investigator = supervisor.startsWith('Dr.') || supervisor.startsWith('Prof.') ? supervisor : `Dr. ${supervisor}`;
    const department = departmentMatch ? departmentMatch[1].trim() : 'Pharmaceutics & Health Sciences';
    const abstract = abstractMatch ? abstractMatch[1].trim() : (lines.slice(1, 8).join(' ').trim() || text.substring(0, 500));

    const combined = `${title} ${department} ${abstract}`.toLowerCase();
    let faculty = 'Faculty of Pharmacy';
    let faculty_code: 'FOP' | 'FCS' | 'FE' | 'FMS' = 'FOP';
    let target_industries = ['Pharmaceuticals', 'Healthcare & Clinical Research'];

    if (combined.includes('comput') || combined.includes('software') || combined.includes('ai') || combined.includes('vision')) {
      faculty = 'Faculty of Information Technology';
      faculty_code = 'FCS';
      target_industries = ['Information Technology', 'Software Engineering'];
    } else if (combined.includes('biomedical') || combined.includes('sensor') || combined.includes('device') || combined.includes('hardware')) {
      faculty = 'Faculty of Engineering';
      faculty_code = 'FE';
      target_industries = ['Medical Instrumentation', 'Biomedical Devices'];
    } else if (combined.includes('management') || combined.includes('business') || combined.includes('supply chain') || combined.includes('esg')) {
      faculty = 'Faculty of Management Sciences';
      faculty_code = 'FMS';
      target_industries = ['Logistics & Supply Chain', 'Export Services'];
    }

    const techStack = techMatch
      ? techMatch[1].split(/[,;|]/).map(t => t.trim()).filter(Boolean)
      : ['Formulation Assay', 'Stability Protocols', 'Analytical Chemistry'];

    return {
      id: `proj-up-${Date.now()}-${index + 1}`,
      project_code: `SHU-${faculty_code}-2026-${Date.now().toString().slice(-3)}${index + 1}`,
      title,
      faculty,
      faculty_code,
      department,
      lead_investigator,
      abstract,
      problem_statement: `Investigates solutions for clinical and industrial formulation challenges in ${department}.`,
      technology_stack: techStack,
      development_stage: 'Lab Prototype',
      trl_level: 4,
      erl_level: 5,
      ip_status: 'Disclosure Filed',
      target_industries,
      commercial_readiness: 'Medium',
      estimated_funding_pkr: 1500000,
      created_at: new Date().toISOString()
    };
  }
}

