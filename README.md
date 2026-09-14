Here is the admin login link : https://travel-unbounded-azure.vercel.app/admin/login

# Travel Unbounded — Experiential Travel Platform

A full-stack luxury travel web application and administrative portal built for the **Full Stack Developer Assignment**. The platform delivers curated experiential destination discovery, real-time booking enquiry capture with MongoDB Atlas persistence, an intelligent Gemini-powered trip planning assistant, and a comprehensive administrative portal featuring pipeline analytics, lightweight CRM enquiry management, and destination content management.

---

## Overview

Travel Unbounded connects travellers with bespoke expeditions across India and international destinations. The application combines an editorial, image-led public browsing experience with a secure back-office operations console:

- **Public Destination Discovery**: Curated expedition catalog featuring India and International journeys with high-resolution photography, itinerary breakdowns, and regional metadata.
- **Booking Enquiry Flow**: Real-time validated enquiry capture persisted directly to MongoDB Atlas with multi-stage lifecycle tracking.
- **AI Travel Assistant**: Interactive travel planner powered by the Google Gemini API that progressively collects traveller preferences to generate structured, personalized itineraries.
- **Administrative Portal**: Role-protected back office providing pipeline analytics, an interactive CRM for enquiry status updates, and a destination CMS with multi-image gallery management.
- **Production Architecture**: Built on Next.js App Router, React 19, TypeScript, and Tailwind CSS, adhering to serverless deployment standards on Vercel.

---

## Features

### Public Website
- **Home Showcase**: Hero banner, value propositions, travel story editorial, and curated expedition grid.
- **Destination Catalog**: Filterable journeys categorized into **India** and **International** expeditions.
- **Destination Detail Pages**: Dynamic server-rendered pages (`/destinations/[slug]`) featuring multi-image galleries, trip highlights, detailed itineraries, and direct enquiry actions.
- **About Page**: Brand story, founder philosophy, and company credentials.
- **Contact & Booking Page**: Dedicated enquiry page (`/contact`) with instant validation and destination pre-selection.
- **Responsive Navigation**: Sticky public header with mobile navigation menu and global footer with destination links.
- **Destination Gallery Showcase**: Dynamic image modal preview and responsive gallery layouts.
- **AI Planning Chatbot**: Floating conversational assistant available across all public surfaces.

### Enquiry System
- **Dual-Layer Validation**: Client-side feedback before submission paired with server-side validation against strict date, boundary, and format rules.
- **MongoDB Atlas Persistence**: Atomic document writes storing contact information, travel specifications, and correlated destination references.
- **Lifecycle Status Pipeline**: Enquiries progress through structured operational statuses: `New` &rarr; `Contacted` &rarr; `Confirmed` &rarr; `Cancelled`.
- **Destination Correlation**: Automatic association between submitted enquiries and published destination slugs.
- **User Feedback**: Instant visual confirmation upon submission, field-specific error states, and friendly retry prompts on connection interruption.

### Admin Portal
- **Standalone Login Experience**: Independent, full-viewport authentication page (`/admin/login`) with zero public chrome or admin shell bleed.
- **Evaluator Access Integration**: One-click credential auto-fill helper pre-configured for evaluation.
- **Security & Route Protection**: Edge middleware verification rejecting unauthorized sessions before rendering protected routes.
- **Analytics Dashboard (`/admin/dashboard`)**:
  - 4-metric KPI strip: Total Leads, Conversion Rate, Top Requested Destination, and Active Destinations.
  - Hero Enquiry Activity chart: 6-month monthly inquiry volume bar chart with dynamic monthly averages.
  - Pipeline distribution: Lead status breakdown donut chart and progress indicators.
  - Customer intelligence: Top requested destinations ranking and accommodation tier preferences.
- **Enquiry Management CRM (`/admin/enquiries`)**:
  - Searchable and filterable data table with server-side pagination.
  - Real-time inline status modification (`PATCH /api/enquiry/[id]`).
  - Slide-in detail panel with customer contact info, trip specifications, and mailto client links.
  - Dedicated mobile card view optimized for viewport widths under 640px.
- **Destination CMS (`/admin/destinations`)**:
  - Visual catalog manager displaying 16:10 aspect ratio destination cards with category tabs.
  - 5-step structured publishing modal (`01 Basic Info`, `02 Trip Details`, `03 Media`, `04 Content`, `05 Publishing`).
  - Multi-image gallery manager with live URL preview, add/remove controls, and broken-image fallbacks.
  - Idempotent destination seeding from curated application datasets.

### AI Travel Chatbot
- **Gemini-Powered Engine**: Built on Google Generative AI (`@google/generative-ai`) leveraging `gemini-2.5-flash`.
- **Progressive Preference Collection**: Dynamically extracts destination, trip duration, budget, party size, travel dates, and personal interests across conversational turns.
- **Structured Output**: Renders day-by-day itineraries, estimated budgets, packing tips, and direct links to booking forms.
- **Security & Prompt Integrity**: Server-side input sanitization, max token caps, and prompt-injection safeguards.
- **Scoped Availability**: Mounted strictly on public pages; unmounted across all administrative surfaces.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Server-side rendering, API route handlers, Edge middleware |
| **UI Library** | [React 19](https://react.dev/) | Component architecture, client state management, hooks |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict static typing across models, API contracts, and components |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Design tokens, utility classes, responsive typography |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud document persistence for enquiries, destinations, and admins |
| **ODM** | [Mongoose 9](https://mongoosejs.com/) | Schema validation, connection caching, document lifecycle methods |
| **Authentication** | [jose](https://github.com/panva/jose) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | JWT session signing/verification and salted password hashing |
| **AI / LLM** | [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) | Multi-turn conversational travel itinerary generation |
| **Visualizations** | [Recharts 3](https://recharts.org/) | Responsive SVG bar charts and donut distributions |
| **Code Quality** | [ESLint 9](https://eslint.org/) | Static analysis and Next.js Core Web Vitals enforcement |
| **Deployment Target** | [Vercel](https://vercel.com/) | Serverless Edge and Node.js runtime execution |

---

## Architecture & Data Flow

### Public Enquiry Flow
```text
Traveller
  └─► Public Form (/contact or /destinations/[slug])
        └─► Client Validation (field-level instant feedback)
              └─► POST /api/enquiry
                    └─► Server Validation (lib/validations/enquiry.ts)
                          └─► MongoDB Atlas (enquiries collection)
                                ├─► 201 Created ──► Confirmation screen
                                └─► 400/500 Error ──► Inline error highlighting
```

### Admin Authentication & Session Flow
```text
Admin User
  └─► Admin Sign In (/admin/login)
        └─► POST /api/admin/auth/login
              ├─► Find user in MongoDB users collection
              ├─► bcrypt.compare(password, user.password)
              └─► Sign JWT (jose) with role: 'admin'
                    └─► Set HTTP-Only Cookie: 'admin_session'
                          └─► Redirect to /admin/dashboard
                                └─► Edge Middleware (middleware.ts) verifies JWT
                                      ├─► Valid: Mounts AdminShell + Layout
                                      └─► Invalid: Clears cookie & redirects to /admin/login
```

### Public vs. Admin Layout Separation
To ensure the administrative login is completely isolated, the application employs a component-tree separation architecture:
- `PublicShell` (`components/layout/PublicShell.tsx`): Evaluates `pathname.startsWith('/admin')`. For all `/admin` routes, it completely unmounts the public `Navigation`, `Footer`, and `ChatWidgetPublic`.
- `AdminShell` (`components/admin/AdminShell.tsx`): Evaluates `pathname === '/admin/login'`. When on `/admin/login`, it returns standalone children with zero admin sidebar, header, or mobile drawer. Protected admin pages mount the authenticated shell only after authentication.

---

## Project Structure

```text
├── app/
│   ├── layout.tsx                    # Root layout wrapping PublicShell
│   ├── page.tsx                      # Public Homepage
│   ├── about/page.tsx                # About page
│   ├── contact/page.tsx              # Contact & booking enquiry page
│   ├── destinations/
│   │   ├── page.tsx                  # Destination catalog listing
│   │   └── [slug]/page.tsx           # Dynamic destination detail page
│   ├── admin/
│   │   ├── layout.tsx                # Admin root layout wrapping AdminShell
│   │   ├── page.tsx                  # Redirects to /admin/dashboard
│   │   ├── login/page.tsx            # Standalone editorial sign-in page
│   │   ├── dashboard/page.tsx        # Pipeline metrics & Recharts analytics
│   │   ├── enquiries/page.tsx        # CRM enquiry management interface
│   │   └── destinations/page.tsx     # Destination CMS catalog interface
│   └── api/
│       ├── enquiry/route.ts          # Public POST & Admin GET enquiries
│       ├── enquiry/[id]/route.ts     # Admin PATCH enquiry lifecycle status
│       ├── destinations/route.ts     # Public GET & Admin POST destinations
│       ├── destinations/[id]/route.ts# Admin PATCH & DELETE destination
│       ├── analytics/summary/route.ts# Admin GET aggregated pipeline metrics
│       ├── chat/route.ts             # Public POST Gemini travel assistant
│       └── admin/auth/
│           ├── login/route.ts        # Admin login handler
│           ├── logout/route.ts       # Admin session termination
│           └── me/route.ts           # Admin session inspection
├── components/
│   ├── admin/                        # AdminHeader, AdminNav, AdminMobileNav,
│   │                                 # AdminShell, EnquiriesTable, DestinationsManager,
│   │                                 # DestinationForm, StatusBadge
│   ├── chat/                         # ChatWidgetPublic floating assistant
│   ├── contact/                      # BookingEnquiryForm
│   ├── destinations/                 # DestinationCard, DestinationMeta, ImageGallery
│   ├── home/                         # HeroSection, StorySection, CTASection
│   └── layout/                       # Navigation, Footer, PublicShell
├── data/
│   └── destinations.ts               # Curated seed dataset (India & International)
├── lib/
│   ├── ai/gemini.ts                  # Google Gemini API client & prompt harness
│   ├── auth.ts                       # JWT signing and verification helpers
│   ├── mongodb.ts                    # Cached Mongoose connection provider
│   └── validations/                  # Schema validation logic (enquiry, destination, chat)
├── models/
│   ├── Destination.ts                # Destination Mongoose schema
│   ├── Enquiry.ts                    # Enquiry Mongoose schema
│   └── User.ts                       # Admin User Mongoose schema
├── scripts/
│   ├── seed-admin.mjs                # Seeds evaluator admin account
│   ├── seed-destinations.mjs         # Seeds destinations into MongoDB Atlas
│   └── verify-*.mjs                  # Automated test and verification suites
├── types/                            # Shared TypeScript interfaces
├── middleware.ts                     # Edge JWT session protection for /admin routes
└── package.json
```

---

## Local Setup & Installation

### 1. Prerequisites
- **Node.js**: v18.18.0 or higher (v20+ recommended)
- **npm**: v9+
- **MongoDB Atlas Connection URI**

### 2. Clone Repository
```bash
git clone https://github.com/eshwarrao123/Travel-Unbounded
cd Travel-Unbounded
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Populate the required environment variables in `.env.local`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_secure_random_jwt_secret_min_32_chars
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

> **Security Notice**: `.env.local` contains private secrets and is excluded from source control via `.gitignore`. Never prefix backend keys (`JWT_SECRET`, `GEMINI_API_KEY`, `MONGODB_URI`) with `NEXT_PUBLIC_`.

### 5. Seed Database
Initialize the administrator credentials and the destination catalog:
```bash
# Seed initial evaluator admin account (admin@gmail.com / TravelAdmin@123)
npm run seed:admin

# Seed India and International destinations into MongoDB Atlas (idempotent)
npm run seed:destinations
```

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Windows Native Tooling Note**: If running on Windows with SWC/Turbopack binary loading limitations, launch the development server using Webpack mode:
> ```bash
> npm run dev -- --webpack
> ```

### 7. Production Build Verification
```bash
# Standard build
npm run build

# Webpack fallback for Windows environments
npx next build --webpack
```

---

## Environment Variables

| Variable | Scope | Required | Purpose |
|---|---|---|---|
| `MONGODB_URI` | Server-Only | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Server-Only | Yes | Cryptographic secret for signing admin session JWTs |
| `GEMINI_API_KEY` | Server-Only | Yes | Google Gemini API key for the AI itinerary assistant |
| `GEMINI_MODEL` | Server-Only | No | Gemini model identifier (defaults to `gemini-2.5-flash`) |
| `ADMIN_SEED_EMAIL` | Server-Only | No | Override default admin seed email (`admin@gmail.com`) |
| `ADMIN_SEED_PASSWORD` | Server-Only | No | Override default admin seed password (`TravelAdmin@123`) |

---

## API Specification

### Public Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/destinations` | Public | Returns published destinations with category/search filters |
| `POST` | `/api/enquiry` | Public | Submits a customer travel enquiry with validation |
| `POST` | `/api/chat` | Public | Multi-turn conversational AI travel itinerary planner |

#### Sample: `POST /api/enquiry`
```json
{
  "fullName": "Aarav Mehta",
  "countryCode": "+91",
  "contactNumber": "9876543210",
  "email": "aarav.mehta@example.com",
  "dateOfTravel": "2026-11-20",
  "numberOfPeople": 2,
  "hotelCategory": "Luxury",
  "numberOfChildren": 0,
  "destinationSlug": "masai-mara",
  "destinationName": "Kenya Masai Mara Migration"
}
```

### Admin Endpoints (Protected)

All administrative endpoints require an authenticated `admin_session` HTTP-Only cookie.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/admin/auth/login` | Public | Authenticates admin credentials, sets JWT cookie |
| `POST` | `/api/admin/auth/logout` | Authenticated | Clears `admin_session` cookie |
| `GET` | `/api/admin/auth/me` | Authenticated | Inspects active session identity |
| `GET` | `/api/enquiry` | Authenticated | Paginated CRM enquiry list with search and status filtering |
| `PATCH` | `/api/enquiry/[id]` | Authenticated | Updates enquiry lifecycle status (`New`, `Contacted`, `Confirmed`, `Cancelled`) |
| `POST` | `/api/destinations` | Authenticated | Creates a new destination in MongoDB Atlas |
| `PATCH` | `/api/destinations/[id]` | Authenticated | Updates existing destination metadata, pricing, or media |
| `DELETE` | `/api/destinations/[id]` | Authenticated | Deletes a destination from MongoDB Atlas |
| `GET` | `/api/analytics/summary` | Authenticated | Aggregates real-time pipeline volume, conversion rates, and demand |

---

## Authentication & Security

- **Salted Password Hashing**: Passwords are hashed using `bcryptjs` with 10 salt rounds before database storage. Plaintext passwords are never persisted or logged.
- **Stateless JWT Sessions**: Session tokens are signed using the `jose` library with HS256 encryption. Tokens contain only minimal operational claims (`sub`, `email`, `role: 'admin'`).
- **HTTP-Only Cookies**: JWTs are stored exclusively in `admin_session` cookies configured with:
  - `httpOnly: true` (prevents client-side XSS token access)
  - `sameSite: 'lax'` (mitigates CSRF vulnerabilities)
  - `secure: true` (automatically enforced in production HTTPS environments)
- **Edge Middleware Protection**: `middleware.ts` intercepts all requests to `/admin` and `/admin/:path*`. Unauthenticated requests to protected admin routes are automatically redirected to `/admin/login`.
- **API Authorization**: Server-side route handlers independently verify JWT claims before executing database modifications.
- **Strict Input Validation**: Payloads are sanitized against domain schemas in `lib/validations/`, rejecting unexpected fields and prototype pollution attempts.

---

## Assumptions & Scope Decisions

In accordance with the assignment specifications, the following design and technical decisions were made:

- **Curated Dataset vs. GDS Inventory**: Destination pricing and duration reflect curated expedition packages rather than live airline Global Distribution Systems (GDS) or real-time hotel booking engines.
- **Image URL Storage**: Destination imagery utilizes validated, high-resolution external URLs (Unsplash) rather than a dedicated multipart binary storage service.
- **Client-Managed Chat Session**: AI chatbot conversation history is maintained within client session memory across conversational turns rather than permanently stored in a separate chat-history collection.
- **Payment Processing**: Payment gateways (Stripe, Razorpay) are out of scope; enquiries capture customer intent for personalized consultant follow-up.
- **Legacy Enquiry Support**: The schema accommodates both legacy enquiry documents and newer submissions containing correlated destination metadata.
- **Evaluation Accessibility**: The admin portal provides pre-configured evaluator auto-fill helpers to facilitate review without manual database inspection.

---

## Validation & Error Handling

The application enforces a defense-in-depth validation strategy:

- **Client Validation**: Instant visual feedback for email formatting, phone digit boundaries, future travel dates, and required fields.
- **Server Validation**: Independent re-validation on every API endpoint preventing bypass via direct HTTP calls:
  - Dates must strictly occur in the future.
  - Party sizes must be positive integers (&ge; 1).
  - Hotel categories are validated against permitted enum sets (`Standard`, `Deluxe`, `Luxury`).
  - Status updates are validated against allowed lifecycle transitions (`New`, `Contacted`, `Confirmed`, `Cancelled`).
- **HTTP Status Codes**: Standard RESTful response codes are returned across all endpoints (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`).
- **Graceful Failure States**: Network errors, database connection drops, and API limits trigger user-friendly retry banners without breaking page layouts.

---

## Responsive Design

Both the public website and the administrative console are designed across key device breakpoints:

- **Desktop (1440px+)**: Multi-column editorial layouts, split-screen balanced admin login, 4-metric KPI grid, Recharts analytics, and dense CRM data table.
- **Tablet (768px – 1024px)**: Fluid two-column grids, adaptive navigation headers, and flexible form layouts.
- **Mobile (390px – 640px)**:
  - Admin login converts to an intentional top-banner image with centered form below, avoiding horizontal scroll.
  - Admin portal transitions from a fixed sidebar to an accessible slide-out mobile drawer with backdrop blur.
  - Enquiries CRM switches from a wide data table to stacked cards for readable mobile scanning.
  - Public navigation collapses into a full-screen drawer.

---

## SEO & Accessibility

- **Metadata Architecture**: Comprehensive metadata configuration across static and dynamic routes including OpenGraph tags and search engine directives (`noindex, nofollow` strictly applied to `/admin/*`).
- **Semantic HTML5**: Native `<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`, and `<footer>` landmarks.
- **Form Accessibility**: Explicit `<label htmlFor="...">` bindings, visible focus rings (`focus:ring-2 focus:ring-[#0f4c3a]/15`), and `aria-modal="true"` dialog semantics with keyboard escape dismissal.
- **Touch Target Sizing**: Interactive controls, buttons, and links maintain a minimum 44px touch height on mobile devices.

---

## Testing & Verification

The codebase has been verified through automated test suites and compiler checks:

### Automated Test Suites
Run the dedicated verification scripts:

```bash
# Verify authentication flow and database password hashing (27 assertions)
node scripts/verify-auth-flow.mjs

# Verify Gemini AI chatbot API, progressive extraction, and guardrails (28 assertions)
node scripts/verify-chat-api.mjs

# Verify admin enquiry retrieval, search, filter, and pagination (35 assertions)
node scripts/verify-enquiries-api.mjs

# Verify destination CRUD operations, validation, and ID handling (31 assertions)
node scripts/verify-destinations-api.mjs

# Verify analytics calculations, conversion rates, and status metrics (24 assertions)
node scripts/verify-analytics-api.mjs

# Verify destination tracking and enquiry correlation (26 assertions)
node scripts/verify-destination-tracking.mjs
```

### Static Analysis & Build Verification
```bash
# TypeScript compiler verification (Zero errors)
npx tsc --noEmit

# ESLint 9 code quality check (Zero errors, zero warnings)
npm run lint

# Production compilation & static page generation (16/16 routes verified)
npx next build --webpack
```

---

