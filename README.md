# CampusPulse — Growth Campaign Management Platform

> **NxtWave Hiring Assignment Solution**  
> A growth campaign management platform simulating a 7-day campaign to attract 500 final-year engineering students to the live workshop **“Build Your First AI Project in 60 Minutes.”**

---

## 🌟 Executive Summary

**CampusPulse** provides growth operators with real-time attribution, channel pacing analytics, campus partner leaderboards, financial controls, and a deterministic action recommendation engine.

- **Zero External Paid API Keys Required**: Runs entirely locally using Next.js 14 App Router, TypeScript, Tailwind CSS, and SQLite with Prisma ORM.
- **Strict Data Transparency**: Simulated campaign data is prominently labeled as demo simulation data. Real user registrations are strictly isolated from demo records.
- **Security & Privacy Guardrails**: Student personal registration records (PII) in CSV export are protected by an Operator Access Code (`campus_operator_2025`). An unauthenticated Anonymized Summary export is provided for public evaluation without PII.
- **Deterministic Action Engine**: Growth insights are computed via transparent mathematical pacing formulas and channel deficit ratios—no black-box or hallucinated models.
- **Financial Integrity**: Planned allocations (₹2,000 ceiling) are separated from actual expenditures. Zero money is claimed to be spent unless verified through the itemized expense ledger.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.6 (Strict mode enabled, zero errors) |
| **Styling** | Tailwind CSS with responsive layout and accessible design tokens |
| **Database & ORM** | SQLite + Prisma Client v5.22.0 (Zero-config local persistence) |
| **Testing** | Vitest (33 automated unit, integration, and E2E user journey tests) |
| **Linting** | ESLint with Next.js Core Web Vitals config |
| **Icons & UI** | Lucide React |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.17.0 or newer (v20+ / v24+ supported)
- **npm**: v9+ / v10+ / v11+

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Local Database
An SQLite database file (`prisma/dev.db`) is configured via `.env`:
```env
DATABASE_URL="file:./dev.db"
```

Initialize the database schema:
```bash
npx prisma db push
```

### 3. Seed Realistic Demo Dataset
Seeds 6 campus partners across top engineering universities, 263 simulated student registrations (146 Campus Partner + 50 Student Referrals + 32 College Communities + 20 Targeted Email + 15 Direct, representing Day 4 mid-campaign pacing), and duplicate attempts:
```bash
npm run db:seed
```

### 4. Run Automated Verification Tests
Runs all 34 automated test suites across 7 test files:
```bash
npm test
```

### 5. Launch the Application Locally
For development with hot reload:
```bash
npm run dev
```
Or for production performance:
```bash
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Platform Capabilities & Verification Flows

### 1. Public Registration Page (`/`)
- **Workshop Proposition**: Detailed 60-minute curriculum breakdown, prerequisites, and transparent disclaimer (*No unconfirmed placements or certifications promised*).
- **Referral Code Auto-Capture**: Automatically populates referral codes from incoming URLs (e.g. `http://localhost:3000/?ref=RVCE-AI24`).
- **Validation & Normalization**: Emails are trimmed and converted to lowercase. Full name, engineering branch, and graduation year are strictly validated.
- **Duplicate Prevention**: Database-enforced unique email constraint. If an existing student registers again, a friendly alert is shown and a duplicate submission is logged for auditing.
- **Student Share Generation**: Upon successful registration, each student receives their own referral code (e.g. `STU-XXXXX`) with one-click copyable WhatsApp and Email invite templates with feedback.

### 2. Growth Dashboard (`/dashboard`)
- **Top KPIs**: Unique registrations vs the 500 target, progress percentage, remaining registrations, and timeline pacing (Day 4 of 7).
- **Required Run-Rate**: Real-time calculation of daily registrations needed to hit the target:
  $$\text{Required Run-Rate} = \left\lceil \frac{500 - \text{Unique Registrations}}{\text{Remaining Campaign Days}} \right\rceil$$
- **Registrations by Channel**: Visual comparison of Target vs Actual across all 5 channels:
  - Campus Partners (Target: 300)
  - Student Referrals (Target: 100)
  - College Communities (Target: 60)
  - Targeted Email (Target: 40)
  - Direct / Unattributed (Strictly separated without guessing)
- **7-Day Trend Chart**: Cumulative registrations compared against the linear pacing benchmark.
- **Data Hygiene**: Tracks blocked duplicate attempts and unattributed direct traffic percentage.
- **Protected CSV Export**: Operator-gated detailed export (Passcode: `campus_operator_2025`) or public anonymized summary export.

### 3. Campus Partner Leaderboard & Referral Assets (`/partners`)
- **Partner Leaderboard**: Displays rank, campus lead name, college, referral code, link clicks, verified conversions, conversion rate %, and share of the 300 partner target.
- **Ambassador Onboarding**: Form to onboard new campus ambassadors with custom codes.
- **Copyable Assets**: Select any partner to generate custom WhatsApp and Email invitation templates. Copy buttons include instant feedback toasts.

### 4. Campaign Planning & Financial Controls (`/budget`)
- **Planning Targets**: Itemized breakdown of the 500 registration goal.
- **Planned vs Actual Budget Distinction**:
  - Creative Assets: ₹300 planned
  - Optional Targeted Promotion: ₹1,200 planned
  - Contingency Reserve: ₹500 planned
  - **Total Budget Cap**: ₹2,000
- **Zero Fake Spend**: Verified actual spend starts at ₹0.00. Funds are never claimed to be spent without verified receipts entered via the itemized expense ledger.
- **Cost per Registration**: Real-time CPA calculation:
  $$\text{CPA} = \frac{\text{Verified Actual Spend}}{\text{Unique Registrations}}$$

### 5. Deterministic Action Recommendation Engine (`/recommendations`)
Calculates operational recommendations with full mathematical explanations:
- **Velocity Target**: Flags velocity acceleration needed based on remaining days.
- **Channel Deficit Analysis**: Identifies channels lagging behind their timeline pacing:
  $$\text{Expected Channel Count} = \text{Target} \times \frac{\text{Elapsed Days}}{\text{Total Days}}$$
- **Strongest Channel Focus**: Pinpoints the highest ROI channel to double down on.
- **Mid-Campaign Review Checklist**: Triggers operational checkpoints at Day 4 to audit click-to-registration conversion drop-offs.
- **Edge Case Protection**: Safely handles zero remaining days and 100%+ goal attainment without division-by-zero or NaN errors.

### 6. Demo Simulation Mode & Reset
- **High-Visibility Banner**: Displays `DEMO SIMULATION — fictional data` across all views when simulated data is active.
- **Two-Step Confirmation Reset**: Opening the simulation manager requires typing `RESET` to clear demo data.
- **Data Isolation**: Simulated records are tagged with `isDemo: true`. Real organic registrations are never wiped when resetting demo data.
- **Instant Re-seeding**: The 263-record simulated dataset can be reloaded at any time with a single click.

---

## 🔒 Security & Privacy Audits

1. **Student Record Protection**:
   - `/api/export` protects personal student records (names, emails, colleges, referral links) behind operator authorization.
   - Default local demo operator access code: `campus_operator_2025`.
   - Public visitors can download an Anonymized Campaign Performance Summary CSV (`/api/export?format=summary`) with zero student PII.
2. **Formula Injection Mitigation (OWASP)**:
   - All exported CSV cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` are prefixed with `'` to prevent spreadsheet formula execution.
3. **Data Isolation**:
   - Destructive reset operations only affect records where `isDemo: true`.
   - Real organic applications (`isDemo: false`) are strictly preserved across resets.

---

## 🧪 Automated Testing

CampusPulse includes 34 automated tests written in Vitest:
```bash
npm test
```

### Test Coverage Highlights:
1. `tests/validation.test.ts` (6 tests):
   - Trimming and lowercase email normalization
   - Rejection of invalid emails, missing names, and short colleges
   - Validation of branches and graduation years
2. `tests/duplicate.test.ts` (3 tests):
   - Unique email database constraint verification (`P2002`)
   - Audit logging of duplicate attempts in `DuplicateSubmission`
3. `tests/referral.test.ts` (7 tests):
   - Partner code attribution to `CAMPUS_PARTNER`
   - Student code attribution to `STUDENT_REFERRAL`
   - UTM source tag attribution (`COLLEGE_COMMUNITIES`, `TARGETED_EMAIL`)
   - Strict separation of unknown/direct traffic without guessing
   - WhatsApp and Email invite template formatting
4. `tests/analytics.test.ts` (5 tests):
   - Exact 263 arithmetic reconciliation (146 + 50 + 32 + 20 + 15 = 263, 237 remaining, 60/day run rate, 65.8/day avg pace)
   - Calculations of unique registrations, remaining target, and required daily run-rate
   - Recommendation wording accuracy with pacing distinction
   - Channel breakdown sums matching unique registrations
   - Budget allocation calculations and remaining reserves
   - Safe handling of zero remaining days and 500+ milestone attainment
5. `tests/csv.test.ts` (3 tests):
   - RFC 4180 cell escaping (quotes, commas, newlines)
   - CSV formula injection protection (`=`, `+`, `-`, `@`)
   - Verification that anonymized summary CSV contains zero student PII
6. `tests/security_demo.test.ts` (2 tests):
   - Proof that demo resets cannot delete real registrations
   - Default operator access code verification
7. `tests/e2e_journey.test.ts` (8 tests):
   - Complete multi-step simulation from partner creation, student referral link, duplicate blocking, peer referral, analytics update, and demo reset.

---

## 🚢 Production Build & Quality Checks

Run the complete quality assurance suite:

```bash
# 1. Run unit, integration, and E2E tests
npm test

# 2. Run ESLint checks (0 warnings, 0 errors)
npm run lint

# 3. Run TypeScript strict type-check (0 errors)
npm run type-check

# 4. Build optimized Next.js bundle
npm run build

# 5. Start production server
npm run start
```

---

## 📁 Repository Structure

```
CampusPulse/
├── prisma/
│   ├── schema.prisma       # Database schema (CampusPartner, Registration, DuplicateSubmission, Expense)
│   ├── seed.ts             # Seeding CLI entrypoint
│   └── dev.db              # Local SQLite database
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/verify # Operator access code verification
│   │   │   ├── demo/       # Demo mode status, reset, and re-seed
│   │   │   ├── expenses/   # Verified expense logger & ledger
│   │   │   ├── export/     # Protected CSV export endpoint
│   │   │   ├── metrics/    # Real-time campaign analytics & recommendations
│   │   │   ├── partners/   # Campus partner management & metrics
│   │   │   └── register/   # Public registration & duplicate handling
│   │   ├── budget/         # Planning targets & financial controls page
│   │   ├── dashboard/      # Growth analytics dashboard
│   │   ├── partners/       # Campus partner leaderboard & asset generator
│   │   ├── recommendations/# Deterministic action engine page
│   │   ├── globals.css     # Tailwind styling
│   │   ├── layout.tsx      # Root layout with banner, navbar, and footer
│   │   └── page.tsx        # Public workshop landing & registration page
│   ├── components/
│   │   ├── DemoSimulationBanner.tsx  # High-visibility demo badge & reset modal
│   │   ├── Navbar.tsx      # Primary navigation bar
│   │   └── OperatorExportModal.tsx   # Privacy guardrail modal for CSV exports
│   └── lib/
│       ├── analytics.ts    # Database calculation engine
│       ├── auth.ts         # Operator authorization guardrails
│       ├── constants.ts    # Workshop details, targets, budget caps, branches
│       ├── csv.ts          # CSV generation and formula injection escaping
│       ├── prisma.ts       # Singleton Prisma client instance
│       ├── recommendations.ts # Deterministic recommendation engine
│       ├── referral.ts     # Attribution resolution & invitation templates
│       ├── seed.ts         # Realistic 7-day demo dataset generator
│       └── validation.ts   # Client/server form validation & normalization
├── tests/
│   ├── analytics.test.ts   # Analytics & recommendation tests
│   ├── csv.test.ts         # CSV export generator tests
│   ├── duplicate.test.ts   # Duplicate prevention & logging tests
│   ├── e2e_journey.test.ts # Complete end-to-end user journey tests
│   ├── referral.test.ts    # Referral attribution & template tests
│   ├── security_demo.test.ts # Data isolation & security tests
│   └── validation.test.ts  # Form validation & normalization tests
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## ⚖️ License
Built for the NxtWave hiring assignment. Free for evaluation and internal review.
