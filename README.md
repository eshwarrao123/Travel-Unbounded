# Travel Unbounded — Experiential Travel Platform

Travel Unbounded is a modern, full-stack travel company web application built as part of the **Full Stack Developer Assignment**. The platform showcases curated Indian and International travel destinations, presents the company's story, and captures customer travel booking enquiries with real-time validation and persistence in MongoDB Atlas.

---

## Technical Stack

The application is built using modern full-stack web technologies:

- **Framework**: [Next.js](https://nextjs.org/) (App Router architecture)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & custom design tokens
- **Database & ODM**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose 9](https://mongoosejs.com/)
- **Code Quality**: [ESLint 9](https://eslint.org/)
- **Target Deployment Platform**: [Vercel](https://vercel.com/)

---

## Project Structure

A high-level overview of the main workspace directories and their responsibilities:

```text
├── app/                  # Next.js App Router (pages, layouts, and API routes)
│   ├── api/enquiry/      # POST /api/enquiry backend route handler
│   ├── destinations/     # Destination listing and detail pages
│   ├── about/            # About page
│   └── contact/          # Contact & Booking Enquiry page
├── components/           # Modular React components
│   ├── contact/          # BookingEnquiryForm with client validation
│   ├── destinations/     # Destination cards, category filters, and detail components
│   ├── home/             # Homepage sections (Hero, Value Prop, Travel Story, CTA)
│   └── layout/           # Fixed Navigation header & Footer
├── data/                 # Local curated dataset (India & International destinations)
├── lib/                  # Shared utilities
│   ├── mongodb.ts        # Cached MongoDB Mongoose connection handler
│   └── validations/      # Server-side schema validation logic
├── models/               # Mongoose data models
│   └── Enquiry.ts        # Booking Enquiry schema definition
├── public/               # Static assets & brand media
```

---

## Local Setup & Installation

Follow these steps to run the application locally:

### 1. Clone the Repository
```bash
git clone https://github.com/eshwarrao123/Travel-Unbounded.git
cd Travel-Unbounded
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory by copying `.env.example`:
```bash
cp .env.example .env.local
```

Open `.env.local` and add your MongoDB Atlas connection string:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Code Quality & Build Checks
```bash
# Run ESLint check
npm run lint

# Create production build
npm run build
```

---

## Environment Variables

| Variable | Scope | Required | Description |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | Server-Only | Yes | Connection string for MongoDB Atlas database. |

> **Security Note**: `MONGODB_URI` is strictly server-only and must never be prefixed with `NEXT_PUBLIC_`. The `.env.local` file is excluded from Git tracking via `.gitignore`. A clean placeholder is provided in `.env.example`.

---

## Database Architecture

- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Collection**: `enquiries`

Each enquiry document stores the following normalized fields:
- `fullName` (String, required, trimmed)
- `countryCode` (String, required, e.g. `+91`)
- `contactNumber` (String, required, 7–15 digits)
- `email` (String, required, normalized lowercase)
- `dateOfTravel` (Date, required, strictly future date)
- `numberOfPeople` (Number, required, minimum 1)
- `hotelCategory` (String, required, enum: `Standard` | `Deluxe` | `Luxury`)
- `numberOfChildren` (Number, default 0, minimum 0)
- `createdAt` (Date, default `Date.now`)

---

## Booking Enquiry Flow

```text
User 
  └─► Booking Enquiry Form (/contact)
        └─► Client-side Validation (Instant field errors)
              └─► POST /api/enquiry (JSON Payload)
                    └─► Server-side Validation (Strict date, format & boundary checks)
                          └─► MongoDB Atlas Persistence
                                ├─► 201 Created ──► Confirmation UI
                                ├─► 400 Bad Request ──► Field-level error highlights
                                └─► 500 Server Error ──► Friendly retry prompt
```

---

## Destination Dataset

The destination data and pricing are stored locally in `data/destinations.ts` as static, curated content:

- **India Expeditions**:
  - Kerala (*Backwaters & Ayurvedic Sanctuaries*)
  - Himachal Pradesh (*Himalayan Valleys & Solang Slopes*)
  - Ladakh (*High-Pass Monasteries & Pangong Lake*)
  - Andaman (*Emerald Archipelago & Radhanagar Beach*)
  - Goa (*Portuguese Heritage & Coastal Sanctuaries*)

- **International Journeys**:
  - Kenya (*Masai Mara Great Migration Safaris*)
  - Vietnam (*Ha Long Bay & Ancient Hoi An*)
  - Tanzania (*Serengeti Plains & Ngorongoro Crater*)
  - Iceland (*Arctic Glaciers & Northern Lights*)
  - Sri Lanka (*Tea Country & Cultural Triangle*)

---

## API Specification

### `POST /api/enquiry`

Submits a new travel enquiry to the system.

- **Request Body** (`application/json`):
  ```json
  {
    "fullName": "Ananya Sharma",
    "countryCode": "+91",
    "contactNumber": "9876543210",
    "email": "ananya@example.com",
    "dateOfTravel": "2026-10-15",
    "numberOfPeople": 2,
    "hotelCategory": "Deluxe",
    "numberOfChildren": 0
  }
  ```

- **Responses**:
  - `201 Created`: Enquiry successfully saved.
    ```json
    { "success": true, "message": "Enquiry submitted successfully." }
    ```
  - `400 Bad Request`: Payload validation failed (field-specific errors returned).
    ```json
    { "success": false, "message": "Validation failed.", "errors": { "email": "Please enter a valid email address." } }
    ```
  - `500 Internal Server Error`: Server/Database error.
    ```json
    { "success": false, "message": "Unable to submit enquiry right now. Please try again later." }
    ```

---

## Design Approach & Aesthetics

The visual identity follows an **editorial, image-led travel publication aesthetic**:
- **Design System**: Follows a cohesive design system with custom CSS tokens for colors, typography, and spacing.
- **Typography & Layout**: Modern sans-serif typography, generous whitespace, warm neutral background tones (`#FDFBF7`), and subtle borders (`#EAE5DC`).
- **Anti-Pattern Avoidance**: Intentionally avoids generic SaaS templates, loud neon gradients, heavy drop-shadows, and unstyled AI-generated UI elements.

---

## Media & Imagery

All destination photography and background imagery are sourced from royalty-free, high-resolution media providers ([Unsplash](https://unsplash.com/)) in accordance with open attribution rules.

---

## Assumptions & Scope Constraints

As outlined in the assignment requirements, the following features are intentionally out of scope:
- **Authentication & User Profiles**: No login or user session management is implemented.
- **Admin Dashboard**: Enquiry retrieval (`GET /api/enquiry`) and management dashboards were omitted per scope instructions.
- **Payments & Dynamic Booking**: No payment gateway or real-time inventory engine is integrated. Destination pricing is static demonstration data.
- **Email Services**: Automated email confirmations (SendGrid/Resend) are intentionally omitted.
- **Destination Detail Pages**: Implemented as additional UI enhancement beyond core requirements.

---

## Deployment Strategy

- **Target Deployment Platform**: Vercel
- **Production Database**: MongoDB Atlas
- **Environment Setup**: In Vercel Project Settings, add `MONGODB_URI` under Environment Variables.
- **Runtime Constraints**: Native Next.js App Router serverless execution. Localhost dependencies are strictly removed.

---

## Project Verification

The project state has been thoroughly verified locally:
- [x] `npm run lint` passes with 0 errors.
- [x] `npm run build` generates clean production bundles across all App Router pages.
- [x] Client-side & Server-side validation flows verified.
- [x] End-to-end local submission to live MongoDB Atlas verified.
