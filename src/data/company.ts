/**
 * Single source of truth for company identity and contact details.
 *
 * Every enquiry button, footer, and contact link reads from this module, so a
 * change is a one-line edit (PRD section 11). These are the confirmed details
 * supplied by the company. Fields the company has not supplied — history,
 * certifications, registration numbers, partners, social accounts — are left
 * out rather than filled with placeholders (PRD sections 24 and 25).
 */

export const company = {
  legalName: 'Ar-Rafiu Integrated Services Limited',
  tradingName: 'Ar-Rafiu Integrated Services',
  contact: {
    /** WhatsApp number in international format, without "+", for wa.me links. */
    whatsapp: '2349067421693',
    /** The same number as it is shown to a visitor. */
    whatsappDisplay: '+234 906 742 1693',
    /** Phone number in international format, for the tel: link. */
    phone: '+2348028394794',
    /** The same number as it is shown to a visitor, in local format. */
    phoneDisplay: '0802 839 4794',
    email: 'arrafiuintegrated@gmail.com',
    address:
      '9, Animashaun Street, off Odonla Road, Poboyejo Estate, Odongunyan, Ikorodu',
    /** Opening time. The company has not supplied the days, so none are stated. */
    businessHours: '8am to 4pm',
    serviceArea: 'From Ikorodu Garage to Odongunyan Bus Stop, Odonla area',
  },
} as const;

/**
 * One-sentence statement of what the company is, used wherever a page needs to
 * orient a visitor quickly. It is held here rather than restated per page so the
 * wording cannot drift between the homepage, the about page and the footer.
 */
export const companySummary =
  'Ar-Rafiu supplies IT equipment and technology, and provides installation, maintenance, repair and replacement.';
