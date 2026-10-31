import { Router, Request, Response } from 'express';

export const intelligenceRouter = Router();

const KARACHI_COMPANIES = [
  {
    id: 'comp-01',
    name: 'Getz Pharma (Pvt) Ltd',
    cluster: 'Korangi Industrial Area',
    sector: 'Pharmaceutical',
    turnover_range: 'PKR 10B+',
    verified_status: true,
    contact_person: 'Head of R&D Partnerships',
    contact_email: 'rd-partnerships@getzpharma.example',
    matching_project_code: 'SHU-FOP-2026-001',
    synergy_potential: 'High',
    tech_needs: ['Novel Drug Delivery', 'Bioequivalence Testing', 'Lyophilization']
  },
  {
    id: 'comp-02',
    name: 'Artistic Milliners (Pvt) Ltd',
    cluster: 'Korangi Industrial Area',
    sector: 'Textile & Apparel',
    turnover_range: 'PKR 25B+',
    verified_status: true,
    contact_person: 'Chief Technology Officer',
    contact_email: 'innovation@artisticmilliners.example',
    matching_project_code: 'SHU-FCS-2026-042',
    synergy_potential: 'High',
    tech_needs: ['Automated Visual Inspection', 'Water Recycling AI', 'Predictive Maintenance']
  },
  {
    id: 'comp-03',
    name: 'Ferozsons Laboratories',
    cluster: 'S.I.T.E. Industrial Area',
    sector: 'Pharmaceutical',
    turnover_range: 'PKR 8B+',
    verified_status: true,
    contact_person: 'Director Corporate Strategy',
    contact_email: 'alliances@ferozsons.example',
    matching_project_code: 'SHU-FOP-2026-001',
    synergy_potential: 'Strategic',
    tech_needs: ['Biologics Formulation', 'API Synthesis', 'Local Sourcing']
  },
  {
    id: 'comp-04',
    name: 'Shabbir Tiles & Ceramics Ltd',
    cluster: 'Landhi Industrial Area',
    sector: 'Chemical & FMCG',
    turnover_range: 'PKR 12B+',
    verified_status: true,
    contact_person: 'Plant Engineering Manager',
    contact_email: 'tech@shabbir.example',
    matching_project_code: 'SHU-FE-2026-018',
    synergy_potential: 'Moderate',
    tech_needs: ['Thermal Imaging', 'Waste Heat Recovery', 'Material Strength Analysis']
  }
];

/**
 * GET /api/v1/intelligence/radar
 */
intelligenceRouter.get('/radar', (req: Request, res: Response) => {
  const { cluster, sector } = req.query;

  let results = [...KARACHI_COMPANIES];
  if (cluster && cluster !== 'ALL') {
    results = results.filter(c => c.cluster === cluster);
  }
  if (sector) {
    results = results.filter(c => c.sector.toLowerCase().includes(String(sector).toLowerCase()));
  }

  res.json({
    total: results.length,
    clustersCovered: ['Korangi Industrial Area', 'S.I.T.E. Industrial Area', 'Landhi Industrial Area', 'Port Qasim'],
    companies: results
  });
});

/**
 * POST /api/v1/intelligence/opportunity-match
 */
intelligenceRouter.post('/opportunity-match', (req: Request, res: Response) => {
  const { project_code } = req.body;
  const matched = KARACHI_COMPANIES.filter(c => !project_code || c.matching_project_code === project_code);

  res.json({
    project_code: project_code || 'All',
    matchedPartners: matched,
    recommendations: [
      'Initiate non-disclosure bilateral agreement (NDA) via SHU ORIC Directorate.',
      'Prepare joint HEC Technology Development Fund (TDF) grant application.',
      'Conduct site visit to Korangi industrial facilities for pilot validation.'
    ]
  });
});

