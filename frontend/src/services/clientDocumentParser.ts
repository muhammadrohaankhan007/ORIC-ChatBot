import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { Project } from '@/types';

export async function parseDocumentClient(file: File): Promise<Project[]> {
  const ext = file.name.toLowerCase().split('.').pop() || '';

  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
    return parseExcelProjectsClient(file);
  }

  if (ext === 'docx' || ext === 'doc') {
    return parseWordProjectsClient(file);
  }

  // Fallback: try Excel first, then Word
  try {
    return await parseExcelProjectsClient(file);
  } catch {
    return await parseWordProjectsClient(file);
  }
}

export async function parseExcelProjectsClient(file: File): Promise<Project[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const parsedProjects: Project[] = [];
  const seenTitles = new Set<string>();

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
    if (!Array.isArray(rows) || rows.length === 0) continue;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || typeof row !== 'object') continue;

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

      const title = rawTitle
        .replace(/^project\s*\d+\s*[-:]\s*/i, '')
        .replace(/^topic\s*\d+\s*[-:]\s*/i, '')
        .trim();

      if (seenTitles.has(title.toLowerCase())) continue;
      seenTitles.add(title.toLowerCase());

      const rawAbstract =
        row['Project Abstract'] ||
        row['Abstract'] ||
        row['Description'] ||
        row['Project Objectives'] ||
        row['Objectives'] ||
        row['Summary'] ||
        row['Details'] ||
        `Research investigation into ${title} conducted at Salim Habib University.`;

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

      const supervisor = String(rawSupervisor).replace(/\s+\d+$/, '').trim();
      const leadInvestigator = supervisor.startsWith('Dr.') || supervisor.startsWith('Prof.')
        ? supervisor
        : `Dr. ${supervisor}`;

      const courseTitle =
        row['Course Title'] ||
        row['Department'] ||
        row['Course'] ||
        row['Discipline'] ||
        row['Subject'] ||
        'Pharmaceutics';

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

      const rawCode = row['Course Code'] || row['Project Code'] || row['Code'] || row['Class Nbr'] || '';
      const project_code = rawCode
        ? String(rawCode).split(' ')[0]
        : `SHU-${faculty_code}-2026-${String(parsedProjects.length + 1).padStart(3, '0')}`;

      let techStack: string[] = [];
      if (row['Technical Stack'] || row['Technology Stack'] || row['Technologies']) {
        const raw = String(row['Technical Stack'] || row['Technology Stack'] || row['Technologies']);
        techStack = raw.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
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

      const trl = typeof row['TRL'] === 'number' ? Math.min(9, Math.max(1, row['TRL'])) : 3 + (i % 4);
      const erl = typeof row['ERL'] === 'number' ? Math.min(9, Math.max(1, row['ERL'])) : 4 + (i % 3);

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
        created_at: new Date().toISOString(),
      });
    }
  }

  return parsedProjects;
}

export async function parseWordProjectsClient(file: File): Promise<Project[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const fullText = (result.value || '').trim();

  if (!fullText) {
    throw new Error('Word document contains no readable text.');
  }

  const projects: Project[] = [];
  const baseName = file.name.replace(/\.[^/.]+$/, '').trim();

  const projectSections = fullText.split(/(?=(?:^|\n)(?:Project\s+\d+|###\s+Project|\bProject\s+Title:))/i);

  if (projectSections.length > 1) {
    for (let idx = 0; idx < projectSections.length; idx++) {
      const section = projectSections[idx].trim();
      if (section.length < 40) continue;
      const p = extractProjectFromTextClient(section, `${baseName} - Part ${idx + 1}`, idx);
      if (p) projects.push(p);
    }
  }

  if (projects.length === 0) {
    const p = extractProjectFromTextClient(fullText, baseName, 0);
    if (p) projects.push(p);
  }

  return projects;
}

function extractProjectFromTextClient(text: string, defaultTitle: string, index: number): Project | null {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
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
    ? techMatch[1].split(/[,;|]/).map((t) => t.trim()).filter(Boolean)
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
    created_at: new Date().toISOString(),
  };
}
