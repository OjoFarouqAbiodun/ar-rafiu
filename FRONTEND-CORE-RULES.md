# FRONTEND-CORE-RULES

## Reusable Frontend Engineering & Design Standard

**Status:** Mandatory
**Scope:** All frontend projects
**Applies To:** AI agents, AI coding assistants, human developers, and generated code
**Priority:** These rules take precedence over convenience, generic templates, and default AI generation patterns.

---

# 1. CORE DIRECTIVE

Build every interface as a **deliberately designed digital product**, not as a generic AI-generated website.

The frontend must feel:

* Intentional
* Human-designed
* Brand-specific
* Visually distinctive
* Responsive
* Accessible
* Fast
* Maintainable
* Production-ready

Do not blindly follow common AI-generated website patterns such as:

* Generic centered hero sections
* Repetitive three-card layouts
* Excessive rounded cards
* Random gradients
* Excessive glassmorphism
* Unnecessary shadows
* Generic dashboard layouts
* Oversized text without hierarchy
* Tiny buttons
* Excessive whitespace without purpose
* Repeated `border-radius` values everywhere
* Inter/Roboto/system fonts without considering the brand
* Decorative elements that do not communicate anything
* Excessive animations
* Template-like sections that could belong to any website

Every major design decision must have a reason related to the **brand, content, user, or product**.

Do not make a website look different merely for the sake of being different.

---

# 2. PROJECT-FIRST DESIGN THINKING

Before writing substantial frontend code, understand the project.

Identify:

1. The purpose of the website/application
2. The target users
3. The primary user actions
4. The brand personality
5. The visual direction
6. The content hierarchy
7. The required pages
8. The responsive requirements
9. Accessibility requirements
10. Technical constraints

If design references, brand assets, screenshots, existing code, or content are provided, study them before making implementation decisions.

Do not invent a completely different visual language when an established brand system already exists.

When requirements are ambiguous, choose the most reasonable interpretation based on the existing project rather than introducing unnecessary features or visual complexity.

---

# 3. DESIGN SYSTEM BEFORE RANDOM STYLING

Do not style individual elements independently without considering the larger design system.

Establish reusable design tokens for:

* Colors
* Typography
* Spacing
* Border radius
* Shadows
* Container widths
* Breakpoints
* Motion
* Z-index layers
* Component states

Prefer CSS custom properties or the project's existing design-token system.

Example:

```css
:root {
  --color-primary: ...;
  --color-secondary: ...;
  --color-background: ...;
  --color-surface: ...;
  --color-text: ...;
  --color-text-muted: ...;
  --color-border: ...;

  --space-xs: ...;
  --space-sm: ...;
  --space-md: ...;
  --space-lg: ...;
  --space-xl: ...;

  --radius-sm: ...;
  --radius-md: ...;
  --radius-lg: ...;

  --container-max: ...;

  --ease-standard: cubic-bezier(...);
  --ease-emphasis: cubic-bezier(...);
}
```

Do not create dozens of arbitrary values when a smaller, coherent scale can accomplish the same result.

---

# 4. TYPOGRAPHY ARCHITECTURE

Typography is part of the brand identity, not an afterthought.

## 4.1 Font Selection

Do not automatically use:

* Inter
* Roboto
* Arial
* system-ui

unless they genuinely fit the project.

Choose typography according to the project's personality.

### Luxury / Editorial / Cultural

Consider:

* High-contrast serif
* Refined transitional serif
* Elegant display type
* Sophisticated serif + neutral sans-serif combinations

### Modern / Technology / SaaS

Consider:

* Geometric sans-serif
* Neo-grotesque
* Contemporary grotesque
* Wide or slightly distinctive sans-serif families

### Bold / Youthful / Creative

Consider:

* Strong display type
* Expressive grotesques
* Characterful sans-serifs
* Controlled typographic contrast

Font choices must remain readable and practical.

Do not choose unusual fonts merely to appear creative.

---

## 4.2 Typography Scale

Use responsive typography.

Prefer `clamp()` for major headings and display text.

Example:

```css
h1 {
  font-size: clamp(2.5rem, 6vw, 5rem);
}

h2 {
  font-size: clamp(2rem, 4vw, 3.5rem);
}

h3 {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
}
```

These values are examples, not fixed requirements.

The actual scale must be determined by the project's visual hierarchy.

---

## 4.3 Body Text

Body text must remain comfortable to read.

As a general baseline:

* Avoid body text below `16px`
* Prefer approximately `16–20px` depending on context
* Use approximately `1.5–1.75` line-height for long-form text
* Maintain appropriate paragraph spacing
* Avoid excessively long text lines

Aim for approximately **45–80 characters per line** for comfortable reading where practical.

---

## 4.4 Heading Rhythm

Large headings should feel intentional rather than cramped.

Typical starting points:

```css
font-weight: 600–800;
line-height: 1.05–1.2;
letter-spacing: -0.02em;
```

Adjust according to the chosen typeface.

Do not blindly apply negative letter spacing to every heading.

---

# 5. COLOR ARCHITECTURE

Color must be treated as a system.

When brand colors are provided, preserve their identity and build supporting colors around them.

Create functional variations such as:

* Primary
* Primary hover
* Primary active
* Primary subtle
* Secondary
* Secondary hover
* Background
* Surface
* Elevated surface
* Text
* Muted text
* Border
* Success
* Warning
* Error
* Information

Do not randomly introduce colors simply because a section looks empty.

---

## 5.1 Palette Expansion

When necessary, derive:

* Tints
* Shades
* Transparency levels
* Muted versions
* Surface versions
* Border versions

from the existing brand palette.

Maintain visual harmony throughout the interface.

---

## 5.2 Neutral Colors

Avoid defaulting automatically to pure:

```css
#000000
#FFFFFF
```

unless the design specifically calls for them.

Consider sophisticated neutrals such as:

```css
#0A0B0D
#111215
#F8F9FA
#F4F6F8
```

However, never introduce off-black or off-white values merely because they are considered “premium.”

The final colors must serve the actual design.

---

## 5.3 Accessibility

Color contrast is mandatory.

Do not use:

* Faint text on light backgrounds
* Dark text on insufficiently dark surfaces
* Low-contrast placeholders
* Decorative colors that interfere with readability

Interactive states must remain distinguishable.

Do not rely on color alone to communicate meaning.

---

# 6. LAYOUT ARCHITECTURE

Layouts must have a clear visual hierarchy.

Do not automatically construct every section as:

```text
Heading
Paragraph
Three Cards
Button
```

That pattern is overused and often produces generic interfaces.

Use appropriate layout systems including:

* CSS Grid
* Flexbox
* Container queries where useful
* CSS positioning
* Responsive composition

---

## 6.1 Editorial Composition

When appropriate, use:

* Asymmetric columns
* Unequal grid fractions
* Offset elements
* Overlapping compositions
* Varied content widths
* Large visual anchors
* Intentional whitespace
* Strong vertical rhythm

Example:

```css
grid-template-columns: 1.3fr 1fr;
```

But asymmetry must serve the content.

Do not introduce asymmetry simply to make the design look “AI-proof.”

---

## 6.2 Container System

Establish a consistent content container.

Example:

```css
.container {
  width: min(100% - 2rem, var(--container-max));
  margin-inline: auto;
}
```

Use consistent horizontal gutters across responsive breakpoints.

Avoid arbitrary container widths across different sections unless there is a clear design reason.

---

# 7. COMPONENT ARCHITECTURE

Build reusable components where repetition genuinely exists.

Components should have:

* One clear responsibility
* Predictable structure
* Clear naming
* Reusable styling
* Accessible interaction states

Do not create components simply to make the code appear “architected.”

Avoid both extremes:

### Too little structure

One enormous component containing the entire application.

### Too much structure

Dozens of microscopic components that make simple changes unnecessarily difficult.

Use the simplest architecture that remains maintainable.

---

# 8. SEMANTIC HTML

Use semantic HTML5 elements wherever appropriate:

```html
<header>
<nav>
<main>
<section>
<article>
<aside>
<footer>
```

Use headings according to document hierarchy.

Do not use `<div>` elements when a semantic element communicates the purpose better.

Avoid unnecessary wrapper elements.

Do not skip heading levels purely for visual sizing.

Visual size and semantic hierarchy are separate concerns.

---

# 9. INTERACTIVE ELEMENTS

Interactive elements must feel substantial and intentional.

Minimum recommended touch target:

```text
48 × 48px
```

This applies especially to:

* Buttons
* Navigation controls
* Menu triggers
* Icon buttons
* Form controls
* Touch interactions

Buttons should have enough:

* Padding
* Contrast
* Visual hierarchy
* Hover feedback
* Focus feedback
* Active feedback

Do not create tiny buttons simply because they look compact in a desktop mockup.

---

# 10. BUTTON & CONTROL DESIGN

Do not use the same button treatment everywhere.

Establish clear hierarchy:

* Primary action
* Secondary action
* Tertiary action
* Destructive action
* Icon action

States should be intentionally designed:

```text
Default
Hover
Focus
Active
Disabled
Loading
```

Never remove focus indicators without providing an accessible replacement.

---

# 11. MOTION & INTERACTION

Motion should communicate hierarchy and interaction.

Do not animate everything.

Use animation for purposes such as:

* Revealing content
* Establishing hierarchy
* Confirming interaction
* Guiding attention
* Transitioning between states
* Creating a sense of physical continuity

Avoid:

* Constant floating animations
* Excessive parallax
* Random spinning elements
* Unnecessary bounce effects
* Long loading animations
* Animation on every scroll event

---

## 11.1 Motion Easing

Avoid default linear motion for most UI interactions.

Prefer intentional easing curves.

Example:

```css
transition:
  transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
  opacity 0.3s ease,
  background-color 0.3s ease;
```

Do not use:

```css
transition: all;
```

when it causes unnecessary properties to animate.

Prefer explicitly defining animated properties.

---

## 11.2 Reduced Motion

Respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Motion must never be required to understand or use the interface.

---

# 12. RESPONSIVE DESIGN

Responsive design is not simply shrinking desktop layouts.

Design deliberately for:

* Mobile
* Tablet
* Desktop
* Large desktop where relevant

Consider changes in:

* Navigation
* Grid structure
* Typography
* Spacing
* Image cropping
* Content order
* Interaction patterns
* Button arrangement

A layout that technically fits on mobile but is difficult to use is not considered responsive.

---

# 13. MOBILE-FIRST BEHAVIOR

When appropriate, establish the core layout for smaller screens first and progressively enhance it.

Do not assume desktop is the primary experience.

Mobile layouts must receive intentional design decisions rather than being treated as an afterthought.

---

# 14. ACCESSIBILITY

Accessibility is a core engineering requirement.

Implement where applicable:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Proper labels
* Accessible form controls
* Appropriate ARIA only when necessary
* Sufficient color contrast
* Alternative text for meaningful images
* Decorative image handling
* Reduced-motion support
* Logical reading order

Do not use ARIA to compensate for incorrect HTML when semantic HTML can solve the problem.

---

# 15. FORMS

Forms must be clear and usable.

Every input must have an understandable label.

Provide:

* Validation feedback
* Error states
* Success states where appropriate
* Focus states
* Loading states
* Disabled states
* Helpful input guidance

Do not rely exclusively on placeholder text as the label.

Error messages must explain what went wrong and, where possible, how to correct it.

---

# 16. IMAGES & MEDIA

Images are part of the design system.

Do not use random stock images merely to fill empty areas.

When images are provided:

* Preserve their intended visual role
* Use appropriate aspect ratios
* Avoid unwanted distortion
* Use `object-fit` appropriately
* Provide meaningful alt text where necessary
* Lazy-load non-critical images where appropriate

For decorative imagery, avoid unnecessary accessibility noise.

---

# 17. ICONOGRAPHY

Use one coherent icon system.

Do not mix unrelated icon styles without a deliberate design reason.

Maintain consistency in:

* Stroke weight
* Visual scale
* Corner treatment
* Alignment
* Spacing

Do not replace familiar interface icons with obscure decorative symbols simply to appear unique.

---

# 18. DESIGN CONSISTENCY

Consistency does not mean every element must look identical.

Maintain consistency in:

* Typography
* Spacing logic
* Interaction behavior
* Component states
* Color roles
* Iconography
* Border treatment
* Motion language

Allow controlled variation where it improves hierarchy or branding.

---

# 19. PERFORMANCE

Do not sacrifice performance for visual effects.

Prioritize:

* Efficient assets
* Proper image sizing
* Lazy loading
* Code splitting where appropriate
* Minimal unnecessary JavaScript
* Efficient rendering
* Avoidance of layout shifts
* Reusable styles
* Reasonable dependency usage

Do not install a library for a feature that can reasonably be implemented with existing project capabilities.

Do not introduce frameworks or dependencies without a clear technical reason.

---

# 20. JAVASCRIPT & FRONTEND LOGIC

Keep frontend logic understandable and modular.

Avoid:

* Global state when local state is sufficient
* Unnecessary DOM manipulation
* Repeated logic
* Hardcoded data scattered throughout components
* Massive event handlers
* Unnecessary abstractions

Separate:

* UI
* Data
* Business logic
* API communication
* Utilities

according to the project's complexity.

Do not over-engineer a simple project.

---

# 21. CSS ENGINEERING

Write predictable CSS.

Prefer:

* CSS custom properties
* Logical properties where useful
* Responsive units
* Grid/Flexbox
* Component-scoped styles where appropriate
* Reusable utility patterns when they improve consistency

Avoid excessive:

```css
!important
```

Avoid deeply nested selectors.

Avoid magic numbers unless there is a documented design reason.

Avoid duplicated styles that should be shared.

---

# 22. Z-INDEX & LAYERING

Do not randomly assign large z-index values.

Establish a meaningful layering system.

Example:

```css
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-modal: 300;
--z-toast: 400;
```

Adjust according to the project's actual requirements.

---

# 23. CODE COMMENTS

Comments must explain **why**, not obvious **what**.

Do not write AI-style comments such as:

```js
// Set button active
// Header container
// Loop through items
// Add event listener
```

Avoid comments that simply translate the code into English.

Use comments when explaining:

* Non-obvious architectural decisions
* Mathematical layout calculations
* Complex algorithms
* Browser workarounds
* Accessibility considerations
* Complex animation timelines
* Important technical constraints

If the code is already self-explanatory, do not add a comment.

---

# 24. NAMING

Use clear, descriptive names.

Avoid vague names such as:

```text
box
thing
stuff
data1
section2
temp
newComponent
```

Prefer names that communicate purpose:

```text
heroContent
assetTable
maintenanceHistory
primaryNavigation
userProfile
```

Follow the naming convention already established by the project.

Do not rename existing project conventions unnecessarily.

---

# 25. CONTENT & UX

Do not treat content as filler.

Headings, descriptions, labels, button text, and supporting copy should communicate actual meaning.

Avoid generic AI copy and empty marketing language unless the project's actual brand/content requires such language. Section 36 defines the full standard and the phrases to watch for.

Use the supplied content whenever possible.

Do not invent business claims, statistics, testimonials, certifications, reviews, awards, or company history. Section 36.6 lists the full set of evidence that must never be fabricated.

---

# 26. STATES ARE PART OF THE DESIGN

Every important interactive component should be considered across its relevant states.

At minimum, consider:

```text
Default
Hover
Focus
Active
Disabled
Loading
Error
Empty
Success
```

A component is not complete simply because its default state looks good.

---

# 27. DATA & CONTENT REALISM

Use realistic content structures during development.

Do not create obviously fake repetitive content merely to populate the interface.

When actual content is unavailable:

* Use clearly structured placeholder data
* Keep the structure realistic
* Make replacement straightforward
* Do not invent claims presented as real information

Section 36.12 covers how to keep placeholder copy distinguishable from approved content.

---

# 28. SECURITY & SAFE FRONTEND PRACTICES

Never expose:

* API secrets
* Private keys
* Passwords
* Database credentials
* Authentication secrets
* Private tokens

in frontend code.

Assume anything shipped to the browser can be inspected by the user.

Validate and sanitize data appropriately at system boundaries.

Do not treat frontend validation as a replacement for server-side validation.

---

# 29. BROWSER & DEVICE COMPATIBILITY

Test the interface across realistic environments.

At minimum, consider:

* Chrome
* Edge
* Safari where relevant
* Mobile browsers
* Keyboard interaction
* Touch interaction

Do not rely on a single viewport.

Check for:

* Overflow
* Broken layouts
* Text wrapping
* Fixed-position elements
* Modal behavior
* Sticky elements
* Touch target sizes
* Unexpected horizontal scrolling

---

# 30. AI-SPECIFIC IMPLEMENTATION RULE

AI is a development assistant, not the design authority.

When generating code:

1. Understand the existing project.
2. Inspect existing conventions.
3. Reuse established components.
4. Avoid unnecessary rewrites.
5. Avoid introducing unnecessary dependencies.
6. Preserve working functionality.
7. Make the smallest sensible change.
8. Explain meaningful architectural decisions.
9. Verify that the implementation actually works.
10. Do not claim something was tested when it was not tested.

Never fabricate:

* Test results
* API responses
* Browser behavior
* File contents
* Existing components
* Project requirements
* User data

If information is unavailable, state the assumption clearly.

---

# 31. EXISTING PROJECT PRESERVATION

When modifying an existing project:

**Do not rewrite working code unnecessarily.**

Before changing architecture:

* Inspect the existing structure
* Identify dependencies
* Understand current behavior
* Identify reusable components
* Preserve working functionality

Do not replace an existing library, framework, component, or implementation simply because another approach is more familiar.

Changes should be intentional and scoped.

---

# 32. DESIGN QUALITY CONTROL

Before considering a page complete, inspect it critically.

Check:

### Visual

* Does the hierarchy make sense?
* Does the design feel specific to the project?
* Is spacing consistent?
* Are elements aligned?
* Are there unnecessary decorative elements?
* Does the page feel balanced?
* Does the visual identity remain consistent?

### Responsive

* Does mobile work properly?
* Does tablet work properly?
* Does desktop work properly?
* Is there horizontal overflow?
* Do headings wrap naturally?
* Do images maintain appropriate proportions?

### Interaction

* Do buttons have clear states?
* Do links behave correctly?
* Are hover states useful?
* Are focus states visible?
* Are loading/error/empty states handled?

### Accessibility

* Can the interface be navigated with a keyboard?
* Are form controls labeled?
* Is contrast sufficient?
* Are semantic elements used correctly?
* Does reduced motion work?

### Code

* Is the code readable?
* Are components appropriately structured?
* Is logic duplicated?
* Are there unnecessary dependencies?
* Are comments meaningful?
* Are there unnecessary wrappers or abstractions?

---

# 33. ANTI-GENERIC DESIGN CHECK

Before finalizing any major page, ask:

> Could this exact interface be generated for ten unrelated companies by changing only the logo and colors?

If the answer is yes, the design requires another iteration.

The solution is not to add random visual effects.

Instead, improve:

* Information hierarchy
* Brand expression
* Layout composition
* Typography
* Content presentation
* Interaction design
* Visual storytelling
* Component relationships

The interface should feel like it belongs specifically to its product, organization, or audience.

---

# 34. ANTI-OVERDESIGN CHECK

Avoid solving generic design with excessive decoration.

Do not add:

* Random gradients
* Unnecessary blobs
* Excessive glass effects
* Decorative lines everywhere
* Excessive animations
* Floating shapes without purpose
* Giant text without content justification
* Excessive shadows
* Excessive rounded cards

Every visual element should contribute to:

**Brand + Content + Hierarchy + Usability**

If it contributes to none of these, remove it.

---

# 35. IMPLEMENTATION PRIORITY

When requirements conflict, prioritize in this order:

1. Correct functionality
2. Accessibility
3. Usability
4. Content hierarchy
5. Responsive behavior
6. Performance
7. Visual consistency
8. Brand expression
9. Motion and visual polish

Visual aesthetics must never break functionality, accessibility, or usability.

---

# 36. CONTENT & COPYWRITING STANDARDS

Copy is not decoration applied after the design is finished. It is a primary design material and must be designed deliberately rather than produced by default.

This section extends section 25 and section 27 with the detailed working rules for user-facing copy. Those sections state the principle; this section states how to apply it.

It does not alter the priority order in section 35. Copy still never outranks functionality, accessibility, or usability.

## 36.1 Write for the user, not for the company

Begin from where the visitor actually is:

* The problem they have
* The need they are trying to meet
* The question they arrived with
* The situation they are in
* The goal they are working towards
* The concern holding them back
* The outcome they want

Avoid writing primarily to praise the company.

Illustration only, and not approved copy for any project:

```text
Weak direction:
"Leading provider of innovative, cutting-edge ICT solutions."

Stronger direction:
"Need equipment for a new setup, or trying to replace something that has
stopped working? Tell us what you need and we can help you work through
the options."
```

The first describes the company. The second names the visitor's situation and indicates what happens next.

Test any opening line: could it appear unchanged on a competitor's site? If so, it is probably about the company rather than the reader.

## 36.2 Avoid generic AI and business marketing language

Treat phrases such as these as warning signs when they add little real meaning:

* cutting-edge solutions
* seamless experience
* innovative solutions
* empowering businesses
* unlock your potential
* transform your business
* tailored solutions for your unique needs
* committed to excellence
* comprehensive solutions
* world-class service
* next-generation technology
* trusted partner

This is not a mechanical ban. Any of these may be correct when the project's brand voice genuinely calls for it and the surrounding context supports the claim.

The rule is to avoid empty, interchangeable marketing language: wording that could be moved to any company in any industry without changing its meaning.

When a phrase carries no information, replace it with something specific or remove it.

## 36.3 Make copy communicate, not decorate

Every important piece of copy should be doing at least one of these jobs:

* Explain
* Answer
* Reassure
* Clarify
* Guide
* Demonstrate relevance
* Address an objection
* Help the visitor decide
* Lead naturally to an action

If a paragraph cannot be assigned one of those purposes, it is not earning its place.

Do not add paragraphs simply to make a section look complete.

## 36.4 Use problem, relevance, benefit, reassurance, action where it helps

A common and effective order is:

```text
Problem -> Relevance -> Benefit -> Reassurance -> Action
```

Use it when it genuinely helps a visitor understand why something matters and what they can do next.

Do not force this structure onto every section. Reference material, specification tables, contact details, and policy or legal text usually do not benefit from it.

## 36.5 Prefer specific, human CTAs

A call to action should make the next step obvious.

Prefer context-specific actions:

* Ask About This Product
* Discuss Your Setup
* Request a Repair
* Ask About Availability
* Talk to Us About Your Requirement

Avoid leaning repeatedly on vague actions such as:

* Get Started
* Learn More
* Discover More
* Explore
* Click Here

These are not forbidden, but each should have a clear reason to exist. If a visitor could not tell what happens after clicking, the label is too vague.

The visual treatment of calls to action is covered separately in section 10.

## 36.6 Do not fabricate persuasive evidence

Never invent:

* Statistics
* Testimonials
* Reviews
* Client names
* Project history
* Years of experience
* Certifications
* Awards
* Guarantees
* Response times
* Prices
* Product availability
* Technical specifications
* Product capabilities
* Business achievements
* Claims of market leadership

If the information is not known, do not approximate it. Either write useful neutral copy that does not depend on the missing fact, or leave the factual field explicitly pending approval.

See also section 30 on never fabricating results or requirements.

## 36.7 Separate persuasive copy from factual claims

Copy can communicate benefits and user relevance without inventing facts.

It is acceptable to explain, in general terms, why a category of product or service matters to someone in the visitor's situation.

It is not acceptable to claim that this specific company, or this specific product, provides a capability, specification, or outcome unless that has been verified.

Persuasion belongs in relevance and clarity. Facts belong in verified data.

## 36.8 Make each project sound like itself

Copy should reflect:

* The actual industry
* The audience
* The product or service
* The brand personality
* The communication context

Avoid interchangeable copy that could be moved to ten unrelated company websites by changing the logo and company name.

Section 33 states the equivalent test for design.

## 36.9 Vary content structure

Do not make every section:

```text
Heading
Generic paragraph
Three cards
CTA
```

Let the structure follow the information being communicated. A comparison may need a table. A process may need ordered steps. A single strong statement may need no supporting paragraph at all.

See section 6 on layout architecture.

## 36.10 Treat headings as communication

Headings establish hierarchy and meaning. They are navigation, not decoration.

Avoid headings that exist only because a section appears to need one, and avoid repeating the same idea across several headings.

Structural requirements for heading elements, including correct levels and not skipping levels for visual sizing, are in section 8.

## 36.11 Copy and design should inform each other

Content hierarchy should drive visual hierarchy.

The interface should emphasise information according to its importance to the user, not according to what fits a template.

Do not write generic copy first and decorate it afterwards. Decide what the visitor needs to understand, then give that the visual weight.

## 36.12 Distinguish placeholder content from approved content

When real business information is unavailable:

* Do not disguise placeholders as verified information
* Do not fill missing facts with plausible-sounding AI copy
* Keep factual fields easy to replace later
* Make temporary copy useful without making unsupported claims

A clearly marked placeholder is honest and maintainable. An unmarked plausible sentence is neither.

Section 27 covers the structural counterpart.

## 36.13 Perform a dedicated copy audit

Before treating a project as content-complete, read the user-facing copy on its own and inspect it for:

* Generic AI phrasing
* Empty marketing language
* Repetition
* Vague headings
* Weak or repetitive CTAs
* Unsupported claims
* Unnecessary paragraphs
* Unclear communication
* Whether the copy addresses the visitor's actual situation
* Whether the tone fits the brand and audience

This is a separate pass from design review. A page can satisfy every visual, responsive, and accessibility check in section 32 and still be badly written.

---

# 37. FINAL AGENT DIRECTIVE

When working on any frontend project under this standard:

**Do not ask, “What would an AI-generated website normally look like?”**

Ask:

> “What is the clearest, most appropriate, most usable, and most distinctive interface for this specific product and its users?”

Build from that answer.

The goal is not to make the code unusual.

The goal is to make the **design intentional, the engineering disciplined, and the final product specific to its purpose.**
