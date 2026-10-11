# PRD — Ar-Rafiu Integrated Services Limited Website

## 1. Project Overview

### Project Name

**Ar-Rafiu Integrated Services Limited Website**

### Company

**Ar-Rafiu Integrated Services Limited**

### Project Type

Responsive corporate website for an IT equipment, technology solutions, maintenance, and support company.

### Primary Purpose

The website will serve as a professional digital presence for Ar-Rafiu Integrated Services Limited and make it easy for potential customers to:

* Understand what the company does.
* Explore available IT equipment and technology solutions.
* Learn about the company's services.
* View individual products/services and their descriptions.
* Make enquiries about products or services.
* Send enquiries directly to the company's WhatsApp contact.
* Contact the company through available communication channels.

The website should feel like a real business website rather than a generic template or portfolio project.

---

# 2. Business Context

Ar-Rafiu Integrated Services Limited provides IT equipment, technology solutions, installation, maintenance, repair, replacement, and related services.

The confirmed product and service catalogue is recorded in sections 9.2 and 9.3. In summary, the company deals with:

* Servers and server racks
* Computers and laptops
* Printers and photocopiers
* CCTV systems and biometric machines
* Networking equipment
* Inverters, batteries, solar panels, UPS systems and AVR stabilizers
* Software and applications
* Installation, maintenance, repairs and equipment replacement
* IT support, web design, hardware and software engineering, and other technology services

The list may be expanded or modified when the company provides further information.

---

# 3. Problem Statement

Potential customers need a simple way to understand the company's products and services and quickly make enquiries.

A traditional website that only displays company information is not sufficient for this project.

The website should therefore focus on **discovery + enquiry**.

A visitor should be able to:

1. Find a product or service.
2. Understand what it is used for.
3. Decide that they want more information.
4. Start an enquiry without unnecessary steps.
5. Have that enquiry routed directly to the company's WhatsApp.

The website should reduce friction between discovering a product/service and contacting the company.

---

# 4. Target Users

## Primary Users

### 1. Individuals

People looking for:

* Computers
* Printers
* CCTV
* Biometric systems
* Inverters
* Batteries
* Other IT equipment

### 2. Businesses and Organizations

Organizations looking for:

* Servers
* Networking infrastructure
* Server racks
* CCTV systems
* Biometric systems
* Printers and photocopy machines
* Power backup solutions
* IT maintenance
* Repairs and replacements
* Software/application solutions

### 3. IT/Technical Personnel

Technical users who may need:

* Equipment
* Replacement components
* Maintenance
* Repairs
* Infrastructure solutions
* Technical support

---

# 5. Product Goals

The website should:

1. Present Ar-Rafiu as a professional technology solutions company.
2. Clearly communicate the company's products and services.
3. Make products/services easy to discover.
4. Make enquiries extremely easy.
5. Route enquiries to WhatsApp.
6. Work properly across mobile, tablet, and desktop.
7. Load quickly and avoid unnecessary complexity.
8. Provide a professional and trustworthy user experience.
9. Be easy to maintain and update as company information changes.
10. Provide a strong foundation for adding more products and services later.

---

# 6. Non-Goals

The first version of the website will NOT necessarily include:

* Full e-commerce checkout.
* Online payment processing.
* Customer accounts.
* Shopping cart functionality.
* Automated WhatsApp chatbot.
* Complex customer relationship management.
* Online equipment rental management.
* Inventory management for the company.
* Complex employee/admin dashboards.
* Online repair-ticket management.

These may be considered as future features if the company requires them.

---

# 7. Brand & Visual Direction

## Brand Identity

The website must follow the company's existing visual identity.

### Primary Brand Color

```text
Navy Blue
#010067
```

### Secondary/Accent Color

```text
Red
#FB0602
```

### Neutral

```text
White
#FFFFFF
```

These colors should form the foundation of the interface.

The design may derive appropriate:

* Darker/lighter shades
* Subtle backgrounds
* Borders
* Hover states
* Surface colors
* Text colors

from the primary brand palette where appropriate.

Do not introduce unrelated dominant colors.

---

## Logo

The official company logo will be supplied as a project asset.

Expected location:

```text
/public/assets/brand/
```

The supplied logo is the source of truth.

The implementation must NOT:

* Redraw the logo.
* Recreate the logo using CSS.
* Change the logo colors.
* Distort its proportions.
* Replace it with an AI-generated logo.
* Substitute it with a generic icon.

Use the supplied asset as provided.

Prefer SVG for the primary website logo when an SVG version is available.

---

# 8. Design Direction

The website should communicate:

* Professionalism
* Technical expertise
* Reliability
* Modern technology
* Business credibility
* Practical solutions

The design should feel **corporate and technology-focused without becoming a generic SaaS website**.

Avoid:

* Generic AI-generated layouts.
* Excessive rounded cards.
* Random gradients.
* Excessive glassmorphism.
* Huge decorative text.
* Repetitive three-card sections.
* Unnecessary animations.
* Excessive shadows.
* Generic dashboard aesthetics.
* Template-like layouts.

The website should use composition, typography, spacing, imagery, hierarchy, and interaction to create its identity.

All detailed frontend design rules are defined in:

```text
FRONTEND-CORE-RULES.md
```

---

# 9. Proposed Website Structure

The initial website should contain the following major areas.

## 9.1 Home

The homepage should quickly communicate:

* Who Ar-Rafiu is.
* What the company provides.
* Major product/service categories.
* Why visitors should contact the company.
* How to make an enquiry.

Possible sections:

1. Header/navigation
2. Hero section
3. Key product/service categories
4. Featured solutions
5. Services/technical support
6. Why choose/work with Ar-Rafiu
7. Enquiry/contact call-to-action
8. Footer

The exact section arrangement should be determined by the content hierarchy rather than forcing a fixed template.

---

## 9.2 Products / Solutions

A dedicated area for the company's technology equipment and solutions.

Confirmed categories, grouped on the site:

**Computers & infrastructure**

* Servers
* Server racks
* Computers
* Laptops

**Print & document**

* Printers
* Photocopiers

**Security & access control**

* CCTV systems
* Biometric machines

**Power & solar**

* Inverters
* Batteries
* Solar panels
* UPS systems
* AVR stabilizers

**Software & applications**

* Applications

Items that do not fit a listed category are raised through the "Other technology services" enquiry route (section 9.3).

The structure should make it easy to add new product categories later.

---

## 9.3 Services

A dedicated services section/page.

Confirmed services:

* General installation & maintenance
* Equipment repairs
* Equipment replacement
* CCTV installation & maintenance
* Solar & hybrid solar installation & management
* Biometric system installation
* Networking solutions
* Server solutions
* IT support
* Hardware & software engineering
* Software & application solutions
* Web design
* Laptop & desktop supply, services & maintenance
* Solar panel & inverter supply
* UPS solutions
* AVR stabilizers
* Power backup solutions
* Other technology services

The list reflects the official set the company confirmed. The superseded `/services/installation/` and `/services/maintenance/` URLs are kept alive with permanent redirects to `/services/general-installation/`, and the list must be updated whenever the company changes it.

---

## 9.4 Product/Service Detail

Where appropriate, users should be able to open a product or service and view:

* Name
* Image
* Category
* Description
* Key features/specifications where available
* Use cases where appropriate
* Enquiry call-to-action

The page should provide a clear way to enquire about the specific item.

---

## 9.5 About

The About section/page should communicate:

* Company introduction
* What the company does
* Areas of expertise
* Professional approach
* Relevant company information

Do not invent:

* Company history
* Founding year
* Number of employees
* Certifications
* Awards
* Major clients
* Partnerships
* Statistics

unless the company provides those details.

Temporary content may be used during development but must be easy to replace.

---

## 9.6 Contact / Enquiry

The contact/enquiry experience is one of the most important parts of the website.

Users should be able to make an enquiry about:

* A specific product.
* A specific service.
* General IT requirements.
* Repairs.
* Replacement.
* Other technology needs.

The primary enquiry channel should be WhatsApp.

---

# 10. Core User Flow — Product Enquiry

Example:

```text
Visitor
   ↓
Finds Product
   ↓
Opens Product Details
   ↓
Clicks "Enquire on WhatsApp"
   ↓
Website prepares enquiry message
   ↓
WhatsApp opens
   ↓
Customer reviews/sends message
   ↓
Company receives enquiry
```

Example generated message:

```text
Hello Ar-Rafiu Integrated Services Limited,

I would like to make an enquiry about:

Product: [Product Name]

Please provide more information about availability, specifications and pricing.

Thank you.
```

The message should automatically include the relevant product/service name when the enquiry originates from a specific product/service page.

---

# 11. WhatsApp Integration

## Primary Requirement

The website must provide a direct WhatsApp enquiry mechanism.

The initial implementation should use a **pre-filled WhatsApp message**.

The exact company WhatsApp number is currently unavailable and will temporarily use placeholder data.

Example placeholder:

```text
2348000000000
```

This MUST be treated as temporary information.

The actual WhatsApp number will be replaced when supplied by the company.

---

## Important Implementation Requirement

The WhatsApp number should be stored in a central configuration/data location rather than being scattered throughout components.

For example:

```text
company configuration
        ↓
WhatsApp number
        ↓
all enquiry buttons
```

This makes future updates easy.

---

# 12. General Enquiry Form

The website may provide a general enquiry form containing fields such as:

* Name
* Email
* Phone number
* Product/service
* Enquiry/message

The form should provide a clear option to continue the enquiry through WhatsApp.

Example flow:

```text
Fill enquiry form
       ↓
Review information
       ↓
Generate WhatsApp message
       ↓
Open WhatsApp
       ↓
Customer sends enquiry
```

The initial version does not require a backend database for storing enquiries unless this requirement is later introduced.

---

# 13. Product Data Structure

Products should be represented using structured data rather than hard-coded repeated markup.

Example conceptual structure:

```js
{
  name: "Business Server",
  category: "Servers",
  description: "...",
  image: "/assets/products/server.jpg",
  features: [
    "...",
    "...",
    "..."
  ]
}
```

The exact implementation should follow the project's chosen frontend architecture.

This approach should make it easy to:

* Add products.
* Remove products.
* Update descriptions.
* Change images.
* Add categories.
* Reuse product components.

---

# 14. Service Data Structure

Services should also use structured data where practical.

Example:

```js
{
  name: "CCTV Installation",
  description: "...",
  image: "/assets/services/cctv.jpg"
}
```

Avoid duplicating the same markup unnecessarily.

---

# 15. Navigation

The primary navigation should make the main areas easy to reach.

Possible navigation:

```text
Home
Products
Services
About
Contact
```

A prominent WhatsApp enquiry action may also be included.

The exact navigation design should be determined by the final content volume.

On smaller screens:

* Use an accessible mobile navigation.
* Ensure the menu is keyboard accessible.
* Prevent interaction problems caused by overlays.
* Provide clear open/close states.

---

# 16. Homepage Requirements

The homepage should answer the following questions quickly:

### Who are you?

Ar-Rafiu Integrated Services Limited.

### What do you provide?

IT equipment, technology solutions, maintenance, repairs, replacements, and related services.

### What can I find here?

Products and services such as servers, computers, printers, CCTV, biometrics, power solutions, and other IT equipment.

### How do I contact you?

Through the available contact channels, with WhatsApp as the primary enquiry route.

### What should I do next?

Explore products/services or make an enquiry.

---

# 17. Interactive Requirements

The website should feel interactive without excessive animation.

Required interactions may include:

* Navigation menu.
* Product category filtering where useful.
* Product/service detail navigation.
* Hover/focus states.
* WhatsApp enquiry buttons.
* Contact/enquiry interactions.
* Image interactions where useful.
* Mobile navigation.
* Form validation.
* Loading states where applicable.

Interactions should serve a purpose.

Do not add animations merely to make the website appear more advanced.

---

# 18. Forms

All forms must include:

* Proper labels.
* Appropriate input types.
* Required-field handling where needed.
* Clear validation.
* Clear error messages.
* Focus states.
* Loading state when applicable.
* Success/confirmation feedback where applicable.

Form validation should not rely solely on placeholder text.

---

# 19. Responsive Requirements

The website must work properly across:

### Mobile

Approximately:

```text
320px+
```

### Tablet

Approximately:

```text
768px+
```

### Desktop

Approximately:

```text
1024px+
```

### Large Desktop

Approximately:

```text
1440px+
```

The website must not simply shrink the desktop design.

Mobile layouts should be intentionally designed for:

* Touch interaction.
* Smaller screens.
* Simplified navigation.
* Readability.
* Appropriate spacing.
* Efficient content hierarchy.

Test important layouts at multiple viewport sizes.

---

# 20. Accessibility

The website should follow practical accessibility standards.

Requirements include:

* Semantic HTML.
* Proper heading hierarchy.
* Keyboard navigation.
* Visible focus states.
* Accessible buttons and links.
* Form labels.
* Appropriate alt text.
* Sufficient color contrast.
* Do not rely on color alone to communicate information.
* Respect `prefers-reduced-motion`.
* Logical reading order.
* Accessible mobile navigation.

Interactive elements should generally provide touch targets around 48×48px where practical.

---

# 21. Performance

The website should be optimized for fast loading.

Requirements:

* Optimize images.
* Use appropriate image formats.
* Lazy-load non-critical images where appropriate.
* Avoid unnecessary JavaScript.
* Avoid unnecessary dependencies.
* Prevent layout shifts.
* Keep components efficient.
* Load fonts responsibly.
* Avoid oversized media.
* Do not introduce libraries merely for simple functionality.

Performance should be considered during implementation rather than treated as a final-stage task.

---

# 22. SEO

The initial website should include appropriate basic SEO.

Requirements:

* Meaningful page titles.
* Meta descriptions.
* Semantic HTML.
* Proper heading structure.
* Descriptive URLs where applicable.
* Descriptive image alt text.
* Open Graph metadata where appropriate.
* Favicon.
* Appropriate robots configuration.
* Sitemap when deployment requirements justify it.

Do not create keyword-stuffed or unnatural content.

---

# 23. Content Requirements

All website content must be:

* Professional.
* Clear.
* Concise.
* Human-readable.
* Relevant to the company.
* Easy to scan.

Avoid generic AI marketing language such as:

> "We leverage cutting-edge solutions to revolutionize your digital transformation journey."

Prefer direct business language that explains what the company actually provides.

---

# 24. Content Accuracy

The development agent must NOT invent factual company information.

Do not fabricate:

* Certifications.
* Awards.
* Client logos.
* Testimonials.
* Company statistics.
* Years of experience.
* Office locations.
* Staff members.
* Product specifications.
* Product prices.
* Partnerships.
* Government contracts.
* Industry claims.

If information is unavailable, use:

```text
TBD
```

or clearly marked temporary placeholder content.

---

# 25. Temporary Development Information

Until the company provides official information, temporary values may be used for development.

Examples:

```text
Phone:
+234 800 000 0000

WhatsApp:
+234 800 000 0000

Email:
info@example.com

Address:
Lagos, Nigeria
```

These values are development placeholders only.

They MUST be centralized so they can be replaced easily.

Before production deployment, all placeholder company information must be replaced or removed.

---

# 26. Assets

The project should keep company assets, product imagery, service imagery, and other visual resources organized.

Expected structure:

```text
public/
└── assets/
    ├── brand/
    │   ├── logo.svg
    │   ├── logo.png
    │   └── favicon.png
    │
    ├── products/
    │   ├── servers/
    │   ├── computers/
    │   ├── printers/
    │   ├── photocopiers/
    │   ├── cctv/
    │   ├── biometrics/
    │   └── power-solutions/
    │
    ├── services/
    │
    ├── images/
    │
    └── icons/
```

The exact folder structure may be adjusted to suit the project's framework.

---

# 27. Image Requirements

Images should support the purpose and visual identity of the website.

The project may initially use a combination of:

* Company-provided images.
* Licensed stock photography.
* AI-generated imagery where appropriate.
* Temporary representative imagery.

Official company/product imagery should always take priority when it becomes available.

---

## 27.1 Official Company Assets

When official assets are provided by Ar-Rafiu, they become the primary source of truth.

This includes:

* Company logo.
* Product photographs.
* Service photographs.
* Office photographs.
* Staff photographs.
* Installation photographs.
* Project photographs.
* Company documents or other approved visual assets.

Do not modify official assets in ways that alter the company's identity unless specifically requested.

The official logo must NOT be:

* Redrawn.
* Recreated using CSS.
* AI-generated.
* Recolored.
* Distorted.
* Replaced with a generic logo.
* Replaced with an unrelated icon.

---

## 27.2 Temporary Images

Because official product photography may not be available during initial development, temporary imagery may be used.

Temporary imagery should represent the subject accurately without implying that it is an actual Ar-Rafiu-owned product or installation.

For example:

* A generic server image may represent the "Servers" category.
* A generic CCTV installation may represent the "CCTV" service.
* A generic printer may represent the "Printers" category.

Temporary imagery must be replaced with official company/product imagery when suitable assets become available.

---

## 27.3 Preferred Stock Image Sources

For general technology, business, workplace, and infrastructure imagery, prefer reputable image platforms such as:

* Unsplash
* Pexels

Only use images whose applicable license permits the intended use on the website.

Do not download random images from:

* Google Images.
* Pinterest.
* Social media.
* Unverified image websites.
* Websites with unclear licensing.

Search engines may be used to discover a source, but the actual image should be obtained from a source where its usage rights are reasonably clear.

---

## 27.4 AI-Generated Images

AI-generated imagery may be used where it provides a better visual result than available stock imagery.

Appropriate uses include:

* Technology-themed hero imagery.
* Abstract technology visuals.
* Generic server-room scenes.
* Generic infrastructure scenes.
* Conceptual visuals for services.
* Decorative visuals that support the brand.

AI-generated images must NOT falsely represent:

* An actual Ar-Rafiu office.
* An actual Ar-Rafiu employee.
* An actual Ar-Rafiu installation.
* An actual Ar-Rafiu project.
* An actual customer.
* An actual product model sold by Ar-Rafiu.

If a visual represents a generic concept, it should be treated as representative imagery.

---

## 27.5 Product Images

Product imagery should accurately represent the product category.

For example:

```text
Servers
→ Server/server-room imagery

Printers
→ Printer imagery

CCTV
→ CCTV camera/security monitoring imagery

Biometrics
→ Biometric device/access-control imagery

Inverters
→ Inverter/power-backup imagery

Batteries
→ Appropriate battery/power-storage imagery
```

Do not use an unrelated technology image simply because it looks visually attractive.

---

## 27.6 Image Licensing

Before using externally sourced imagery:

1. Identify the source.
2. Check the applicable usage/license terms.
3. Confirm that the intended website/commercial use is permitted.
4. Avoid assets with unclear ownership or licensing.
5. Avoid images containing prominent third-party trademarks unless their presence is relevant and appropriate.
6. Avoid imagery that could falsely imply endorsement or affiliation.

Where practical, keep a simple record of externally sourced images.

Example:

```text
Image:
modern-server-room.jpg

Source:
Pexels

Source URL:
[original image URL]

Usage:
Temporary website imagery
```

Do not include source information visibly on the website unless required by the applicable license.

---

## 27.7 Image Quality

Images should:

* Have suitable resolution.
* Maintain their original aspect ratio.
* Be optimized for web delivery.
* Avoid unnecessary file sizes.
* Use appropriate formats.
* Have appropriate `alt` text where meaningful.
* Use lazy loading for non-critical images where appropriate.

Do not stretch or distort images.

Use `object-fit` or appropriate image containers when cropping is intentional.

---

## 27.8 Image Selection Rules

When selecting imagery, prioritize:

1. Relevance to the actual content.
2. Professional quality.
3. Visual consistency.
4. Appropriate composition.
5. Brand compatibility.
6. Licensing clarity.
7. Performance.

Do not select an image merely because it looks impressive.

---

## 27.9 Image Sourcing Workflow

When the website requires an image that has not been provided:

```text
Need image
    ↓
Check for official company asset
    ↓
If unavailable
    ↓
Check suitable licensed stock imagery
    ↓
Unsplash / Pexels / other reputable source
    ↓
If suitable stock imagery is unavailable
    ↓
Consider AI-generated representative imagery
    ↓
Optimize image
    ↓
Place in appropriate assets directory
    ↓
Use descriptive filename
```

Example:

```text
server-rack-data-center.jpg
cctv-security-camera.jpg
office-networking-equipment.jpg
printer-business-office.jpg
```

Avoid filenames such as:

```text
image1.jpg
final2.png
new-image.jpg
ai-image-final-final.jpg
```

---

## 27.10 Image Replacement

Temporary imagery must be treated as replaceable content.

When the company later provides official photographs:

```text
Temporary image
      ↓
Official company image
      ↓
Update asset reference
      ↓
Keep existing layout/component
```

The website should be structured so that replacing an image does not require rebuilding the entire page.

---

## 27.11 No Fabricated Business Representation

Images must not create false impressions about the company.

Do not use a stock photograph in a way that suggests:

* The building shown is Ar-Rafiu's office.
* The people shown are Ar-Rafiu employees.
* The equipment shown belongs to Ar-Rafiu.
* The installation shown was completed by Ar-Rafiu.
* A recognizable company/product is an official Ar-Rafiu partner.

When necessary, use generic imagery and neutral presentation.

---

## 27.12 Agent Image-Sourcing Rule

If an AI coding agent is instructed to source images, it must NOT blindly download random images from the internet.

The agent should:

1. Determine what type of image is needed.
2. Prefer an existing project asset.
3. Check for an official company asset.
4. If unavailable, use an appropriate licensed source.
5. Prefer reputable sources such as Unsplash or Pexels for general stock imagery.
6. Keep externally sourced assets organized.
7. Avoid unclear licensing.
8. Avoid replacing official company assets.
9. Avoid presenting temporary imagery as actual company photography.
10. Keep image references/data centralized where practical.
11. Tell the developer when an image requires manual selection or licensing verification rather than silently making an uncertain choice.

The agent should prioritize **accurate and appropriate imagery over simply filling every empty section with a picture**.

---

# 28. Technical Requirements

The implementation should:

* Follow the project's existing technology stack.
* Follow `FRONTEND-CORE-RULES.md`.
* Follow `AGENTS.md`.
* Reuse existing dependencies where appropriate.
* Avoid unnecessary dependencies.
* Keep code modular.
* Use reusable components where repetition genuinely exists.
* Keep business/contact configuration centralized.
* Keep product/service data structured.
* Avoid unnecessary global state.
* Maintain clean naming conventions.
* Keep frontend and data concerns appropriately separated.

The agent must inspect the existing project before making architectural decisions.

---

# 29. Security

The frontend must not contain:

* API secrets.
* Private credentials.
* Database passwords.
* Authentication secrets.
* Private tokens.

Public configuration such as a WhatsApp number may be exposed because it is intentionally public contact information.

If a backend is introduced later, sensitive credentials must be stored securely on the server/environment level.

---

# 30. Error & Edge Cases

The website should handle:

### Missing product image

Use an intentional fallback rather than a broken image.

### Missing product description

Do not display fabricated specifications.

### WhatsApp unavailable

The website should still provide alternative contact information if available.

### Invalid form input

Show clear validation feedback.

### Empty product category

Display an appropriate empty state instead of broken UI.

### Mobile navigation

Ensure menu interactions do not trap or block the user.

### External WhatsApp link

The link should be properly encoded so product/service names and enquiry messages do not break the URL.

---

# 31. Future Scalability

The architecture should allow future features such as:

* Product search.
* Advanced filtering.
* Product comparison.
* Product availability.
* Pricing.
* Customer accounts.
* Online quotation requests.
* Repair request tracking.
* Admin dashboard.
* CMS.
* Database-backed products.
* Automated enquiry management.
* WhatsApp Business API integration.
* CRM integration.
* Online payment.
* Customer support/chat system.

These features are NOT required for the first version.

The first version should remain focused and maintainable.

---

# 32. Development Phases

## Phase 1 — Foundation

* Inspect existing project.
* Confirm framework and structure.
* Configure project.
* Add brand assets.
* Establish global design tokens.
* Set typography.
* Set responsive container system.
* Set base UI patterns.

## Phase 2 — Core Layout

* Header.
* Navigation.
* Footer.
* Homepage structure.
* Responsive foundation.

## Phase 3 — Products

* Product data structure.
* Product listing.
* Product categories.
* Product detail views.
* Product enquiry flow.

## Phase 4 — Services

* Service data.
* Services listing.
* Service details.
* Service enquiry flow.

## Phase 5 — Contact & WhatsApp

* Contact section/page.
* General enquiry form.
* WhatsApp message generation.
* WhatsApp routing.
* Validation and edge cases.

## Phase 6 — Content & Polish

* Replace temporary content where official information is available.
* Improve visual hierarchy.
* Refine responsive layouts.
* Add appropriate imagery.
* Improve interaction states.

## Phase 7 — Testing

Test:

* Desktop.
* Tablet.
* Mobile.
* Navigation.
* Forms.
* WhatsApp links.
* Product/service links.
* Keyboard navigation.
* Accessibility.
* Broken images.
* Console errors.
* Responsive overflow.
* Performance.

## Phase 8 — Production Preparation

Before deployment:

* Remove placeholder information.
* Confirm company contact information.
* Confirm WhatsApp number.
* Confirm official logo.
* Confirm company address.
* Confirm email.
* Confirm product/service information.
* Confirm social links.
* Verify all external links.
* Run final build.
* Check for errors.

---

# 33. Acceptance Criteria

The website is considered ready for the initial release when:

### Brand

* [ ] Official logo is correctly displayed.
* [ ] Brand colors are correctly represented.
* [ ] Visual design feels specific to Ar-Rafiu.
* [ ] No generic/template-like visual patterns dominate the website.

### Content

* [ ] Products are clearly presented.
* [ ] Services are clearly presented.
* [ ] Company information is clearly presented.
* [ ] No unsupported company claims are included.

### Enquiries

* [ ] Users can enquire about products.
* [ ] Users can enquire about services.
* [ ] WhatsApp enquiry buttons work.
* [ ] Product/service name can be included automatically in the enquiry.
* [ ] WhatsApp number is centrally configurable.

### UX

* [ ] Navigation is clear.
* [ ] Mobile navigation works.
* [ ] Interactive elements have clear states.
* [ ] Forms provide useful feedback.
* [ ] Users can easily find how to contact the company.

### Responsive

* [ ] Mobile layout works.
* [ ] Tablet layout works.
* [ ] Desktop layout works.
* [ ] No major horizontal overflow exists.
* [ ] Text remains readable at all supported sizes.

### Accessibility

* [ ] Keyboard navigation works.
* [ ] Focus states are visible.
* [ ] Forms have labels.
* [ ] Images have appropriate alt text.
* [ ] Color contrast is acceptable.
* [ ] Semantic HTML is used.

### Technical

* [ ] No unnecessary dependencies were introduced.
* [ ] No secrets are exposed.
* [ ] No major console errors exist.
* [ ] Production build succeeds.
* [ ] Images are reasonably optimized.
* [ ] Existing functionality is preserved.

---

# 34. Out of Scope for Version 1

The following are not required unless specifically requested later:

* Full e-commerce system.
* Payment gateway.
* Shopping cart.
* Customer login.
* Customer dashboard.
* Admin dashboard.
* Automated chatbot.
* CRM.
* Automated WhatsApp Business API.
* Online repair tracking.
* Online inventory management.
* Complex backend infrastructure.
* Customer review system.
* Advanced analytics dashboard.

---

# 35. Future Considerations

If the business later requires more advanced functionality, the website can evolve into a larger platform.

Potential future architecture:

```text
Website
   ↓
Frontend
   ↓
Backend/API
   ↓
Database
   ↓
Products / Services / Customers / Enquiries
```

Possible integrations:

```text
Website
   ├── WhatsApp
   ├── Email
   ├── CRM
   ├── Payment Gateway
   └── Database
```

These should only be introduced when there is a clear business requirement.

---

# 36. Final Product Definition

The final product for Version 1 is a professional, responsive website for **Ar-Rafiu Integrated Services Limited** that allows visitors to:

1. Understand the company.
2. Explore its IT equipment and technology solutions.
3. Explore its services.
4. View relevant product/service information.
5. Make enquiries easily.
6. Send enquiries directly through WhatsApp.

The website should be **functional first, clear second, accessible third, and visually polished without unnecessary complexity**.

It should feel like a website created specifically for Ar-Rafiu Integrated Services Limited rather than a generic AI-generated business template.

All project-specific requirements in this document must be followed together with:

```text
AGENTS.md
FRONTEND-CORE-RULES.md
```

When these documents conflict:

1. Explicit project requirements take priority.
2. Existing project constraints and working functionality must be respected.
3. `FRONTEND-CORE-RULES.md` governs frontend design and engineering standards.
4. `AGENTS.md` governs agent behavior and implementation workflow.
5. When information is genuinely unknown, do not invent it. Mark it as TBD or use clearly identifiable temporary development data.
