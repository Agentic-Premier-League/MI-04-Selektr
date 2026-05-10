# Selektr — Full App Description
### AI Hiring Platform · Next.js + FastAPI · Mastercard Design System

---

## 0. Design Token Quick Reference

All surfaces and components follow the Mastercard design system strictly.

| Token | Value | Role |
|---|---|---|
| `--canvas` | `#F3F0EE` | Default page background — never white |
| `--lifted` | `#FCFBFA` | Nested card / raised section surface |
| `--ink` | `#141413` | Primary text, primary CTA background, footer |
| `--cream-text` | `#F3F0EE` | Text on ink/dark surfaces |
| `--slate` | `#696969` | Muted labels, meta text, placeholders |
| `--signal` | `#CF4500` | Consent/legal actions only |
| `--arc` | `#F37338` | Decorative orbital lines, active indicators |
| `--white` | `#FFFFFF` | Nav pill, modal cards, satellite CTAs |
| `--ghost` | `#E8E2DA` | Watermark headline cream-on-cream |
| `--link` | `#3860BE` | Inline links only |

**Typography:** Sofia Sans (Google Fonts substitute for MarkForMC)
- H1: 64px / weight 500 / letter-spacing -1.28px
- H2: 36px / weight 500 / letter-spacing -0.72px
- H3: 24px / weight 500 / letter-spacing -0.48px
- Eyebrow: 14px / weight 700 / letter-spacing +0.56px / UPPERCASE
- Body: 16px / weight 450 / line-height 1.4
- Buttons: 16px / weight 500 / letter-spacing -0.32px

**Border Radius Scale:** 20px (buttons) · 40px (hero frames, cards) · 999px (pills, nav) · 50% (circles, avatars)

**Shadows:** Nav: `rgba(0,0,0,0.04) 0 4px 24px` · Cards: `rgba(0,0,0,0.08) 0 24px 48px`

---

## 1. App Structure

```
Selektr
├── Recruiter Side
│   ├── /recruiter               → Dashboard (jobs list + analytics strip)
│   ├── /recruiter/jobs/new      → Create Job Posting
│   ├── /recruiter/jobs/[id]     → Job Pipeline (ranked candidates)
│   └── /recruiter/jobs/[id]/candidate/[cid]  → Candidate Profile
│
└── Applicant Side
    ├── /jobs                    → Public Job Board (public jobs only)
    ├── /jobs/[slug]             → Job Detail Page
    ├── /apply/[slug]            → Application Form (Step 1: Profile + Step 2: Interview Q&A)
    └── /apply/[slug]/done       → Confirmation Page
```

---

## 2. Shared Navigation

### Floating Nav Pill
- **Container:** White `#FFFFFF`, `border-radius: 999px`, shadow `rgba(0,0,0,0.04) 0 4px 24px`, positioned 24px below viewport top, centered, `max-width: 1280px`, `padding: 16px 40px`
- **Left:** Selektr wordmark — Sofia Sans, 20px, weight 700, Ink Black. Paired with a small two-circle logomark (ink + arc orange)
- **Center links (Recruiter nav):** "Dashboard" · "Jobs" · "Analytics" — 16px / weight 500 / ink, 48px gap
- **Center links (Applicant nav):** "Browse Jobs" — single centered link
- **Right (Recruiter):** Circular avatar button 40px, initials fallback, Ink Black border 1px
- **Right (Applicant):** 40px circular search icon button (Ink Black border 1px)

### Mobile Nav
- Same pill shape, collapsed: Selektr wordmark + hamburger (48×48px) + search icon
- Hamburger opens full-screen cream overlay with stacked links

---

## 3. Recruiter Side

---

### 3.1 Recruiter Dashboard — `/recruiter`

**Purpose:** Overview of all jobs, quick analytics, entry point to pipeline.

---

#### Ghost Watermark Section
- Full-width cream background `#F3F0EE`
- Ghost headline: "RECRUIT" — Sofia Sans 128px / weight 500 / color `#E8E2DA` / positioned behind hero content, bleeding left off viewport

#### Hero Block
- Eyebrow label: `• OVERVIEW` — arc orange dot `#F37338` + "OVERVIEW" in Ink Black, 14px / weight 700 / tracking +0.56px / uppercase
- H1: "Your hiring pipeline." — 64px / weight 500 / letter-spacing -1.28px / Ink Black
- Subtext: "AI-screened candidates, ranked and ready." — 16px / weight 450 / Slate `#696969`
- CTA: `[ + Post a Job ]` — Ink Black pill, canvas cream text, 20px radius, padding 12px 32px

---

#### Analytics Strip
Four stat cards in a row, `border-radius: 40px`, `background: #FCFBFA` (lifted cream), `padding: 32px`, shadow `rgba(0,0,0,0.08) 0 24px 48px`

| Card | Metric Label (Eyebrow) | Value Display |
|---|---|---|
| 1 | `• OPEN POSITIONS` | Large H2 number e.g. "4" |
| 2 | `• TOTAL APPLICATIONS` | Large H2 number e.g. "38" |
| 3 | `• AVG CANDIDATE SCORE` | Large H2 e.g. "74" with `/100` in slate |
| 4 | `• RED FLAGS DETECTED` | Large H2 e.g. "6" with warning icon |

Each card: Eyebrow 14px / weight 700 / uppercase at top, H2 number in Ink Black centered, slate subtext below.

---

#### Jobs Grid
Section eyebrow: `• YOUR JOBS`
Section H2: "Active positions"

Each **Job Card** — `border-radius: 40px`, `background: #FCFBFA`, `padding: 32px 40px`, shadow level 2, full-width or 2-up grid:

| Field | Design | Notes |
|---|---|---|
| **Visibility Badge** | Pill, `border-radius: 999px`, `padding: 4px 16px`, 12px / weight 700; PUBLIC = arc orange `#F37338` bg + white text; PRIVATE = Ink Black bg + cream text | Top-right of card |
| **Status Badge** | Inline pill next to title; ACTIVE = ink filled; PAUSED = outlined ink; CLOSED = slate filled | |
| **Job Title** | H3 — 24px / weight 500 / ink | |
| **Department / Team** | Eyebrow dot + label — `• Engineering` — 14px / weight 700 / slate | Below title |
| **Location** | 14px / weight 450 / slate + pin icon | |
| **Employment Type** | Pill tag — `border-radius: 999px`, `border: 1px solid #141413`, `padding: 4px 12px`, 12px / weight 500 | e.g. "Full-time" |
| **Posted Date** | "Posted 3 days ago" — 14px / slate | |
| **Application Deadline** | "Closes Jun 30" — 14px / slate | |
| **Applications Count** | "12 applicants" — 14px / weight 500 / ink | |
| **Top Score** | "Best: 91/100" — arc orange `#F37338` text, 14px / weight 700 | |
| **Shareable Link** | Truncated URL pill with copy icon; `border-radius: 999px`, outlined ink border, slate text; copy icon = circular 32px ink button | |
| **CTA: View Pipeline** | Ink Black pill button — "View Pipeline →" — 20px radius, full-width inside card | |
| **CTA: Edit** | Secondary outlined pill — "Edit" — 20px radius, alongside View Pipeline | |

**Empty State (no jobs):**
- Circular illustration (200px diameter, arc orange border, ink icon)
- H3: "No positions yet"
- Body: "Post your first job to start screening candidates."
- CTA: `[ + Post a Job ]` Ink Black pill

---

### 3.2 Create Job — `/recruiter/jobs/new`

**Purpose:** Recruiter fills in job details, sets visibility, generates shareable link.

---

#### Page Header
- Back link: `← Dashboard` — 14px / weight 500 / ink
- Ghost watermark: "POST" — 128px / `#E8E2DA`
- Eyebrow: `• NEW POSITION`
- H1: "Post a job"
- Subtext: "Fill in the details below. Your AI screening will activate the moment the first application arrives." — 16px / weight 450 / slate

---

#### Form — lifted cream card, `border-radius: 40px`, `padding: 48px`, shadow level 2

All inputs: `border-radius: 999px`, `border: 1.5px solid #141413` at 40% opacity, `padding: 14px 24px`, `background: #FFFFFF`, Sofia Sans 16px / weight 450 / ink; focus state: border opacity 100%, shadow `rgba(0,0,0,0.08) 0 4px 12px`

Textareas: same border treatment but `border-radius: 24px` (not pill, since multi-line)

**Section 1 — Role Details**
Section eyebrow: `• ROLE DETAILS`

| Field | Type | Placeholder / Options | Required |
|---|---|---|---|
| Job Title | Text input (pill) | `e.g. Senior Frontend Engineer` | ✓ |
| Department | Text input (pill) | `e.g. Engineering, Design, Product` | ✓ |
| Location | Text input (pill) | `e.g. Remote · Bangalore · Hybrid` | ✓ |
| Employment Type | Pill toggle group | `Full-time` / `Part-time` / `Contract` / `Internship` | ✓ |
| Experience Level | Pill toggle group | `Entry` / `Mid` / `Senior` / `Lead` | ✓ |

**Pill toggle group:** Row of outlined pills; selected = Ink Black fill + cream text; unselected = white bg + ink border + ink text

**Section 2 — Job Description**
Section eyebrow: `• DESCRIPTION`

| Field | Type | Placeholder | Required |
|---|---|---|---|
| Job Description | Textarea (large) | `Describe the role, responsibilities, and what success looks like in this position...` | ✓ |
| Required Skills | Tag input (pill) | `Type a skill and press Enter — e.g. React, Python, SQL` | ✓ |
| Nice-to-have Skills | Tag input (pill) | `Optional skills that would be a bonus` | — |

**Tag input:** Typed tags appear as small ink-outlined pills with an ×; `border-radius: 999px`, `padding: 4px 12px`, 12px / weight 500

**Section 3 — Compensation & Timeline**
Section eyebrow: `• DETAILS`

| Field | Type | Placeholder | Required |
|---|---|---|---|
| Salary Min | Text input (pill) | `₹ Min` or `$ Min` | — |
| Salary Max | Text input (pill) | `₹ Max` or `$ Max` | — |
| Currency | Pill dropdown | `INR` / `USD` / `EUR` | — |
| Application Deadline | Date input (pill) | `DD / MM / YYYY` | — |
| Max Applicants | Number input (pill) | `Leave blank for unlimited` | — |

**Section 4 — Visibility**
Section eyebrow: `• VISIBILITY`
Section body: "Control who can find and apply to this role."

Large toggle card — `border-radius: 40px`, `padding: 32px`, lifted cream bg:

```
[ ◉ PUBLIC  ]   Listed on the Selektr job board.
                Anyone with the link can apply.

[ ○ PRIVATE ]   Not listed on the job board.
                Only people with the direct link can apply.
```

Toggle: Large pill toggle, 64px wide, active state = arc orange `#F37338` fill

**Section 5 — Shareable Link Preview**
Appears after Job Title is filled (auto-generated slug):

```
Your job link will be:
┌─────────────────────────────────────────── [Copy] ─┐
│  Selektr.app/jobs/senior-frontend-engineer-3k2x     │
└────────────────────────────────────────────────────┘
```
Pill container: `border-radius: 999px`, outlined ink border, slate text, copy = 32px circular Ink Black button with copy icon

---

#### Form Footer
- Primary CTA: `[ Post Job ]` — Ink Black pill, `padding: 14px 48px`, 20px radius
- Secondary: `[ Save as Draft ]` — outlined pill, same sizing
- Tertiary: `[ Discard ]` — plain text link, slate, 14px

---

### 3.3 Job Pipeline — `/recruiter/jobs/[id]`

**Purpose:** See all applicants ranked by AI score, filter/sort, take action.

---

#### Job Header Block
- Back link: `← All Jobs`
- Visibility badge (PUBLIC / PRIVATE pill)
- H1: Job title
- Meta row: `📍 Location · ⏱ Full-time · 📅 Posted Jun 10, 2025 · ⌛ Closes Jun 30`
- Shareable link pill + copy icon
- Actions row: `[ Edit Job ]` outlined pill · `[ Pause ]` outlined pill · `[ Close Position ]` clay brown `#9A3A0A` outlined pill

---

#### Pipeline Controls Bar
Lifted cream strip, `border-radius: 40px`, `padding: 16px 32px`:

| Control | Type | Options |
|---|---|---|
| Search | Expanding pill input | `Search candidates by name...` |
| Sort | Pill dropdown | `By Score` / `By Date` / `By Interview Score` |
| Filter: Status | Pill toggles | `All` / `New` / `Screened` / `Interviewed` / `Shortlisted` / `Rejected` |
| Filter: Flags | Pill toggle | `Show Flagged Only` |

---

#### Candidate Cards — Ranked List

Each **Candidate Row Card** — `border-radius: 40px`, `background: #FCFBFA`, `padding: 24px 40px`, shadow level 1, stacked list with 16px gap:

| Field | Design | Notes |
|---|---|---|
| **Rank Badge** | Circle 40px diameter, Ink Black bg, cream text, weight 700; `#1`, `#2`, `#3`... | Far left |
| **Candidate Name** | H3 — 24px / weight 500 / ink | |
| **Applied** | "3 hours ago" — 14px / slate | Below name |
| **Overall Score** | Large circular badge 56px — color-coded: `80–100` = arc orange border + ink text; `60–79` = ink border + ink text; `<60` = slate border + slate text | Center |
| **Resume Score** | "Resume: 84" — 14px / weight 500 | Sub-score |
| **Interview Score** | "Interview: 78" or "Pending —" — 14px / weight 500 / slate | Sub-score |
| **Red Flag Badge** | If flags exist: small pill, `background: #FEF3F0`, `border: 1px solid #CF4500`, signal orange text, "⚠ 2 flags"; no badge if clean | |
| **Status Pill** | `border-radius: 999px`, `padding: 4px 16px`, 12px / weight 700; NEW = lifted cream + ink; SCREENED = ink + cream; SHORTLISTED = arc orange + white; REJECTED = slate + white | |
| **View Profile CTA** | Satellite-style: 48px circular white button, Ink Black `→` arrow icon, `border: 1px solid #141413`; docked to right edge of card | |

---

#### Analytics Panel (below ranked list)

Section eyebrow: `• PIPELINE ANALYTICS`

Two side-by-side cards, `border-radius: 40px`, lifted cream:

**Card A — Score Distribution**
- Bar chart: X-axis = score buckets (0-20, 20-40, 40-60, 60-80, 80-100); Y-axis = count
- Bars: Ink Black fill; active bucket highlighted with arc orange `#F37338`
- Chart title: "Candidate score distribution" — H3
- Axis labels: 12px / slate

**Card B — Pipeline Funnel**
- Vertical funnel: Applied → Screened → Interviewed → Shortlisted
- Each stage: horizontal bar (width = proportion), Ink Black fill, count label right-aligned
- Title: "Conversion funnel" — H3

---

### 3.4 Candidate Profile — `/recruiter/jobs/[id]/candidate/[cid]`

**Purpose:** Deep-dive view of one candidate. Full screening breakdown, Q&A, email drafting.

---

#### Page Header
- Back: `← Pipeline`
- Candidate name — H1
- Applied: "Applied 2 days ago to Senior Frontend Engineer" — 14px / slate
- Status pill selector (interactive dropdown pill): `New` / `Screened` / `Interviewed` / `Shortlisted` / `Rejected`

---

#### Three-Panel Layout (desktop: 3-col · tablet: 2-col · mobile: stacked)

---

##### LEFT PANEL — Resume Analysis (`border-radius: 40px`, lifted cream, `padding: 40px`)

**Score Summary:**
- Overall Score: Circular badge 80px diameter, Ink Black border 3px, H2 number center, "/ 100" in slate below
- Three sub-score rows:
  - `Skills Match` — horizontal pill progress bar + percentage
  - `Experience Relevance` — horizontal pill progress bar + percentage
  - `Education Fit` — horizontal pill progress bar + percentage
- Progress bar: `border-radius: 999px`, height 8px, Ink Black fill on Lifted Cream track

**AI Screening Summary:**
- Eyebrow: `• AI ANALYSIS`
- Paragraph text: Gemini's screening summary — 16px / weight 450 / ink, line-height 1.4
- `border-top: 1px solid rgba(20,20,19,0.1)` separator above

**Red Flags Section (conditional, only if flags exist):**
- Eyebrow: `• RED FLAGS` — signal orange dot `#CF4500` instead of arc orange
- Each flag row: `border-radius: 20px`, `background: #FEF3F0`, `border: 1px solid rgba(207,69,0,0.2)`, `padding: 12px 20px`
  - Icon: ⚠ in signal orange, 16px
  - Flag description: 14px / weight 500 / ink
  - Examples:
    - "Employment gap: 14 months unaccounted (2021 → 2022)"
    - "Title inflation likely — 'CTO' at a 2-person startup with no product shipped"
    - "Skill claim mismatch — lists Kubernetes but no evidence in project descriptions"

**Skills Detected:**
- Eyebrow: `• SKILLS FOUND`
- Row of pill tags: `border-radius: 999px`, `border: 1px solid #141413`, `padding: 4px 12px`, 12px / weight 500 / ink

**Resume Text:**
- Eyebrow: `• SUBMITTED RESUME`
- Collapsible: collapsed = "Show full resume ↓" text link; expanded = monospace-style 14px block with `border-radius: 20px`, `background: #F4F4F4` (soft bone), `padding: 24px`, scrollable max-height 320px

---

##### MIDDLE PANEL — Interview Q&A (`border-radius: 40px`, lifted cream, `padding: 40px`)

**Panel header:**
- Eyebrow: `• INTERVIEW RESPONSES`
- H2: "Candidate answers"
- Interview Score: "Total: 78 / 100" — H3, weight 500, right-aligned

**If applicant has NOT answered yet:**
- Empty state: 180px circular illustration with arc orange orbital line
- H3: "Awaiting responses"
- Body: "The candidate hasn't completed their interview questions yet."
- Status: "Invite link sent" or "Not yet sent"
- CTA: `[ Copy Interview Link ]` — outlined pill

**If applicant HAS answered:**

Each of 5 question blocks, `border-bottom: 1px solid rgba(20,20,19,0.08)`, `padding: 24px 0`:

| Field | Design |
|---|---|
| Question number eyebrow | `• QUESTION 1` — 14px / weight 700 / slate |
| Question text | 16px / weight 500 / ink |
| Answer block | `border-radius: 20px`, `background: #F4F4F4`, `padding: 16px 20px`, 14px / weight 450 / ink, max-height 160px scrollable |
| AI Score | Pill badge right-aligned: `border-radius: 999px`, `padding: 4px 16px`, 12px / weight 700; score and `/20` |
| AI Reasoning | "Why this score:" + 1-line summary — 12px / slate / italic |

---

##### RIGHT PANEL — Actions (`border-radius: 40px`, lifted cream, `padding: 40px`)

**Section 1 — Status**
- Eyebrow: `• CANDIDATE STATUS`
- Pill button group (stacked, full-width):
  - `[ New ]` `[ Screened ]` `[ Interviewed ]` `[ Shortlisted ]` `[ Rejected ]`
  - Active = Ink Black fill + cream text; rest = outlined

**Section 2 — Email Drafts**
- Eyebrow: `• AI COMMUNICATION`
- Three action pills in a row (full-width):
  - `[ ✉ Draft Invite ]` — Ink Black pill
  - `[ ✉ Draft Waitlist ]` — Outlined pill
  - `[ ✉ Draft Reject ]` — Clay brown `#9A3A0A` outlined pill
- Generated email card (appears after clicking, `border-radius: 20px`, white bg, `padding: 24px`, shadow level 1):
  - **To:** candidate email — 14px / slate label + 14px / ink value
  - **Subject:** pre-filled — 14px / slate label + 14px / ink value, editable pill input
  - **Body:** textarea, `border-radius: 20px`, `border: 1px solid rgba(20,20,19,0.2)`, 14px / weight 450 / ink, 180px height
  - **Actions:** `[ Copy Email ]` ink pill · `[ Regenerate ]` outlined pill — small, 12px

**Section 3 — Recruiter Notes**
- Eyebrow: `• PRIVATE NOTES`
- Textarea: `border-radius: 20px`, `border: 1.5px solid rgba(20,20,19,0.2)`, `padding: 16px 20px`, placeholder `"Your private notes about this candidate..."`, 14px / weight 450
- Note: "Visible only to you" — 12px / slate below textarea

**Section 4 — Save**
- `[ Save Changes ]` — Ink Black pill, full-width, `padding: 14px`, 20px radius

---

## 4. Applicant Side

---

### 4.1 Public Job Board — `/jobs`

**Purpose:** Publicly listed roles. Private jobs are invisible here.

---

#### Hero Section
- Ghost watermark: "CAREERS" — 128px / `#E8E2DA`, bleeding right off viewport
- Eyebrow: `• OPEN ROLES`
- H1: "Find your next role."
- Subtext: "Every role listed here uses AI-powered screening — apply once, get a fair shot." — 16px / slate
- Search bar: Expanding pill input, `border-radius: 999px`, `border: 1.5px solid #141413`, `padding: 14px 24px`, `background: #FFFFFF`, placeholder `"Search roles, skills, or teams..."`, 48px height

---

#### Filter Bar
Pill toggle row, `gap: 8px`:
`All` · `Full-time` · `Part-time` · `Contract` · `Internship` · `Remote`

Active pill: Ink Black fill + cream text; Inactive: white bg + ink border

---

#### Job Listing Cards
Each card — `border-radius: 40px`, `background: #FCFBFA`, `padding: 32px 40px`, shadow level 2:

| Field | Design |
|---|---|
| **Department eyebrow** | `• Engineering` — arc orange dot + uppercase slate label, 14px / weight 700 |
| **Job Title** | H3 — 24px / weight 500 / ink |
| **Location** | `📍 Remote · Bangalore` — 14px / slate |
| **Employment Type pill** | `border-radius: 999px`, outlined ink, `padding: 4px 12px`, 12px / weight 500 |
| **Experience Level pill** | Same style — `Mid Level` |
| **Salary range** (if provided) | `₹18L – ₹28L` — 14px / weight 500 / ink |
| **Application Deadline** | `⌛ Closes Jun 30, 2025` — 14px / slate |
| **Posted** | `3 days ago` — 12px / slate, bottom right |
| **Apply CTA** | `[ Apply Now → ]` — Ink Black pill, 20px radius, `padding: 10px 28px` |

**Empty / No-match state:**
- Circular illustration, 160px
- H3: "No roles match your search"
- Body: "Try adjusting your filters or check back soon."

---

### 4.2 Job Detail Page — `/jobs/[slug]`

Accessible via public listing OR private direct link. Private jobs show no breadcrumb back to `/jobs`.

---

#### Header
- Back link (public only): `← All Jobs` — 14px / slate
- Eyebrow: `• [Department]`
- H1: Job title — 64px / weight 500 / ink
- Meta pills row: `📍 Location` · `⏱ Type` · `📊 Level` · `⌛ Deadline`
- Primary CTA: `[ Apply Now → ]` — Ink Black pill, large `padding: 14px 48px`
- Ghost watermark: Job title fragment in `#E8E2DA` behind header

---

#### Content Body (`max-width: 720px`, centered, prose layout)

| Section | Eyebrow | Content |
|---|---|---|
| About this role | `• THE ROLE` | Full job description, rendered markdown, 16px / weight 450 |
| What you'll do | `• RESPONSIBILITIES` | Bullet list, 16px / weight 450 |
| Required skills | `• REQUIREMENTS` | Pill tag row, outlined ink pills |
| Nice-to-have | `• BONUS SKILLS` | Same pill treatment, slate border instead of ink |
| Compensation | `• COMPENSATION` | Salary range in H3, currency |
| Apply by | `• DEADLINE` | Date in weight 500 |

---

#### Sticky Apply Footer (mobile only)
Pinned bottom bar, white background, `border-top: 1px solid rgba(20,20,19,0.1)`, `padding: 16px 24px`:
- Job title truncated — H3 left
- `[ Apply Now ]` — Ink Black pill right

---

### 4.3 Application Form — `/apply/[slug]`

**Purpose:** Two-step form. Step 1 collects profile + resume. Step 2 shows AI-generated questions and collects answers.

---

#### Page Shell
- Ghost watermark: "APPLY" — `#E8E2DA`, 128px
- Eyebrow: `• [Job Title]`
- H1: "Your application"

**Step Progress Indicator:**
Pill progress strip, `border-radius: 999px`, `background: #FCFBFA`, `padding: 8px 24px`, centered below H1:
- `Step 1 of 2 — Your Profile` → `Step 2 of 2 — Interview Questions`
- Active step: Ink Black text / weight 700; Complete step: arc orange check icon + slate text; Upcoming: slate

---

#### STEP 1 — Your Profile

Form card: `border-radius: 40px`, `background: #FCFBFA`, `padding: 48px`, shadow level 2

**Section A — Personal Details**
Section eyebrow: `• ABOUT YOU`

| Field | Type | Placeholder | Required |
|---|---|---|---|
| Full Name | Text input (pill) | `Your full name` | ✓ |
| Email Address | Email input (pill) | `you@example.com` | ✓ |
| Phone Number | Tel input (pill) | `+91 98765 43210` | — |
| LinkedIn URL | URL input (pill) | `linkedin.com/in/yourprofile` | — |
| Portfolio / GitHub | URL input (pill) | `github.com/yourusername` | — |

**Section B — Experience**
Section eyebrow: `• EXPERIENCE`

| Field | Type | Options | Required |
|---|---|---|---|
| Years of Experience | Pill toggle group | `0–1 yr` / `1–3 yrs` / `3–5 yrs` / `5–8 yrs` / `8+ yrs` | ✓ |
| Current / Last Role | Text input (pill) | `e.g. Software Engineer at Infosys` | — |
| Highest Education | Pill toggle group | `High School` / `Diploma` / `B.Tech / B.E.` / `M.Tech / MBA` / `PhD` | — |

**Section C — Resume**
Section eyebrow: `• YOUR RESUME`
Helper text: "Paste the full text of your resume below — include experience, skills, education, and projects. The more detail, the better your AI screening will be." — 14px / slate

| Field | Type | Placeholder | Required |
|---|---|---|---|
| Resume Text | Textarea (large, `border-radius: 24px`) | `Paste your complete resume here...` | ✓ |

Character count indicator below textarea: "1,240 characters · Looks good ✓" — 12px / slate; below 200: "Too short — add more detail" in signal orange

**Section D — Consent**
Checkbox row (custom styled, not a pill):
- `☐ I confirm this is my own work and the information provided is accurate.` — 14px / weight 450 / ink
- `☐ I agree to Selektr's privacy policy and consent to AI processing of my application.` — 14px / weight 450 / ink; "privacy policy" = link blue `#3860BE`

Note: "Your application is processed by AI. No humans will see your details until you pass initial screening." — 12px / slate

**Step 1 CTA:**
`[ Continue to Interview Questions → ]` — Ink Black pill, full-width, `padding: 16px`, 20px radius, disabled until required fields + consent checked

---

#### Step 1 → Step 2 Transition

**Loading screen** (appears after Step 1 submit while Gemini generates questions):
- Centered, full-card
- Animated orbital arc (thin arc orange SVG line, rotating slowly)
- Body: "✦ Generating your personalized questions..." — 16px / weight 500 / ink
- Sub: "We're crafting questions based on your resume and this role." — 14px / slate
- Duration: 3–8 seconds

---

#### STEP 2 — Interview Questions

Form card: same shell as Step 1

**Section header:**
- Eyebrow: `• YOUR INTERVIEW`
- H2: "Answer these questions"
- Subtext: "Take your time — there's no time limit. Your answers will be scored by AI alongside your resume." — 16px / slate

Timer strip (optional, displayed prominently if recruiter set a limit):
`border-radius: 999px`, `background: #FCFBFA`, `padding: 8px 24px`, `⏱ No time limit` or `⏱ 45:00 remaining`

---

**5 Question Blocks** — each separated by `border-bottom: 1px solid rgba(20,20,19,0.08)`, `padding: 32px 0`

| Field | Design |
|---|---|
| Question eyebrow | `• QUESTION 1 OF 5` — 14px / weight 700 / slate |
| Question text | H3 — 24px / weight 500 / ink |
| Answer textarea | `border-radius: 20px`, `border: 1.5px solid rgba(20,20,19,0.2)`, `padding: 16px 20px`, `min-height: 120px`, placeholder `"Write your answer here — be specific and genuine."`, 16px / weight 450 / ink |
| Character count | `"0 / 800 recommended"` — 12px / slate, below textarea right-aligned |
| Status indicator | Below char count: dot + "Not answered" (slate) → "Answer saved ✓" (arc orange) |

---

**Step 2 Footer:**
- `[ Submit Application ]` — Ink Black pill, full-width, `padding: 16px`, disabled until all 5 answered
- Fine print: "Once submitted, you cannot edit your answers." — 12px / slate, centered

---

### 4.4 Confirmation — `/apply/[slug]/done`

---

#### Hero Confirmation Block (centered, full vertical centering)

- Circular illustration: 200px diameter, `border: 3px solid #F37338` (arc orange), Ink Black checkmark `✓` center, 72px
- Decorative orbital arc: thin arc orange SVG arc tracing around the circle, partially visible
- H2: "Application submitted." — 36px / weight 500 / ink, centered
- Body: "We've received your application for **[Job Title]**. The recruiter will be in touch via [candidate email]." — 16px / weight 450 / slate, centered

**What happens next — 3-step row:**
Three cards in a row, `border-radius: 40px`, `background: #FCFBFA`, `padding: 24px 32px`, equal width:

| Step | Eyebrow | Body |
|---|---|---|
| 1 | `• AI SCREENING` | "Your resume and answers are being scored by AI right now." |
| 2 | `• RECRUITER REVIEW` | "A recruiter will review your ranked profile within a few days." |
| 3 | `• YOU'LL HEAR BACK` | "Expect an email from the recruiter if you're shortlisted." |

**CTA (public job applicants only):**
`[ Browse More Roles → ]` — outlined Ink Black pill, centered, `padding: 12px 32px`

**Private job applicants:**
`[ Close this page ]` — plain slate text link, centered

---

## 5. FastAPI Route Schema

```
POST   /api/jobs                        → create job (returns id + slug + link)
GET    /api/jobs                        → list all jobs (recruiter)
GET    /api/jobs/public                 → list public jobs only (applicant board)
GET    /api/jobs/{id}                   → get job detail
PATCH  /api/jobs/{id}                   → update job
DELETE /api/jobs/{id}                   → delete job

POST   /api/jobs/{id}/apply             → submit Step 1 (profile + resume)
                                          → triggers Gemini screening
                                          → returns candidate_id + generated questions
POST   /api/candidates/{cid}/answers    → submit Step 2 (interview answers)
                                          → triggers Gemini answer scoring

GET    /api/jobs/{id}/candidates        → ranked candidate list for a job
GET    /api/candidates/{cid}            → full candidate profile
PATCH  /api/candidates/{cid}/status     → update candidate status

POST   /api/candidates/{cid}/email      → generate email draft (type: invite|reject|waitlist)

GET    /api/jobs/{id}/analytics         → score distribution + funnel data
```

---

## 6. Gemini API Prompts (5 calls)

| Call | Trigger | Returns |
|---|---|---|
| **Screen Resume** | Step 1 submit | `{ overall_score, skills_match, experience_relevance, education_fit, summary, red_flags[] }` |
| **Generate Questions** | After screen | `{ questions: [q1, q2, q3, q4, q5] }` — personalized to resume + JD gaps |
| **Score Answers** | Step 2 submit | `{ scored_answers: [{ question, answer, score, reason }], total_interview_score }` |
| **Red Flag Detect** | Part of screening | `{ flags: [{ type, description, severity }] }` |
| **Draft Email** | Recruiter action | `{ subject, body }` — tone varies by type (invite / waitlist / reject) |

---

## 7. Design Notes for Implementation

- **No pure white backgrounds anywhere** — all page-level backgrounds use `#F3F0EE`
- **All inputs are pill-shaped** (`border-radius: 999px`) except multi-line textareas (`border-radius: 24px`)
- **Orbital arcs** appear on: Job Board hero, Candidate Profile (around score circle), Confirmation page
- **Ghost watermarks** appear on: Dashboard, Create Job, Job Detail, Apply Form — always `#E8E2DA`, large, behind content
- **Eyebrow labels always have a dot prefix** — arc orange `#F37338` on standard sections; signal orange `#CF4500` on red flag / warning sections
- **Score circles** use the arc orange border for high scores to maintain the orbital / circular motif
- **Loading states** use a rotating thin arc SVG rather than a spinner — stays on-brand
- **All CTAs in card footers** are full-width inside the card on mobile

---

*Selektr — built for the 2-hour sprint. Scope to win.*
