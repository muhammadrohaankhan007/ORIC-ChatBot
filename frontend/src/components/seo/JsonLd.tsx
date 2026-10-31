export default function JsonLd() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': 'https://shu.edu.pk/#organization',
        name: 'Salim Habib University',
        alternateName: ['SHU', 'Barrett Hodgson University'],
        url: 'https://shu.edu.pk',
        logo: 'https://shu.edu.pk/assets/images/logo.png',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'NC-24, Deh Dih, Korangi Creek Road',
          addressLocality: 'Karachi',
          addressRegion: 'Sindh',
          postalCode: '74900',
          addressCountry: 'PK'
        },
        department: {
          '@type': 'ResearchOrganization',
          name: 'Office of Research, Innovation & Commercialization (ORIC)',
          description: 'Catalyzing research commercialization, patent filings, and industry academia linkages in Pakistan.'
        }
      },
      {
        '@type': 'SoftwareApplication',
        name: 'SHU ORIC AI – Research, Innovation & Industry Intelligence Ecosystem',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'All Modern Web Browsers',
        description: 'Next-generation AI multi-agent platform connecting university research, Karachi industrial clusters, and venture commercialization.',
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'PKR'
        },
        creator: {
          '@type': 'Organization',
          name: 'Salim Habib University ORIC'
        }
      },
      {
        '@type': 'WebSite',
        '@id': 'https://oric.shu.edu.pk/#website',
        url: 'https://oric.shu.edu.pk',
        name: 'SHU ORIC AI Intelligence Platform',
        publisher: {
          '@id': 'https://shu.edu.pk/#organization'
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://oric.shu.edu.pk/projects?search={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}

