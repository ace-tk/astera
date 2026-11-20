// Company data for the structured data (JSON-LD). Every value is copied from what the site itself says:
//   name / legal name / address / phone / e-mail → the "Mentions légales" page (legalPagesDefaults.js, section 1 "Éditeur du site")
//   LinkedIn                                       → the footer social link
// A unit test (seo/jsonld.test.js) fails if the legal text and these values drift apart.
import { SITE_URL } from '@/config'

export const ORG_ID = `${SITE_URL}/#organization`
export const LOCAL_BUSINESS_ID = `${SITE_URL}/#professionalservice`

export const COMPANY = {
  name: 'AtooPV',
  legalName: 'ALC SAS',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo/horizontal-dark.png`, // 1020 × 258, above Google's 112 px minimum
  email: 'contact@atoopv.com',
  telephone: '+33 4 12 10 06 06', // "04 12 10 06 06" on the site
  address: {
    streetAddress: '47, Grande Rue de Saint-Clair',
    postalCode: '69300',
    addressLocality: 'Caluire-et-Cuire',
    addressCountry: 'FR',
  },
  sameAs: ['https://www.linkedin.com/company/atoopv/'],
}
