# AaharIQ — Smart Food. Better Nutrition. Safer Living.

**AaharIQ** is an AI-powered, bilingual (English & বাংলা) food intelligence platform designed for everyday nutrition literacy, local Bangladeshi dietary science, kitchen food waste reduction, and food safety transparency.

---

## Key Capabilities & 10 Core Modules

1. **Ingredient Recipe Finder (`ingredient-ai`)**
   - Bilingual Bangla & English ingredient normalization (`শাক` → Spinach/Leafy Greens, `বাঁধাকপি` → Cabbage, `মিষ্টি কুমড়া` → Sweet Pumpkin, `আলু` → Potato, `ডিম` → Egg).
   - Supports single-ingredient discovery without requiring 3+ inputs.
   - Strict main-ingredient validation prevents unrelated protein/meat suggestions.
   - Per-recipe unique image mapping (`/public/images/*.jpg` + `resolveRecipePhoto`) guarantees distinct visual presentation for every recipe card.

2. **AI Food Scanner (`food-scanner`)**
   - Upload or capture cooked meals, fresh produce, or packaged foods.
   - Multi-item identification with editable food names and gram portions.
   - Transparent uncertainty disclosure differentiating visual estimation from laboratory measurement.
   - Barcode lookup & downloadable scan reports.

3. **Food Nutrition Analyzer (`nutrition`)**
   - Interactive nutrient calculation grounded in **University of Dhaka INFS Food Composition Table for Bangladesh** and **USDA FoodData Central**.
   - AI estimator fallback clearly labeled as estimated rather than lab-verified.

4. **Bangladesh Food & Nutrition Database (`bd-nutrition`)**
   - **389 Bangladeshi food records**: **381 INFS FCTB (2013)** records + **8 calculated traditional dishes**.
   - Strict raw vs. cooked separation (e.g., Raw BR-28 Rice `01_0012` vs. Boiled BR-28 Rice `01_0037`).
   - Preserves `null` / *Unavailable in FCTB* for unmeasured nutrients rather than fabricating zeros.
   - Integrated **National Dietary Guidelines for Bangladesh 2025**.

5. **Food Safety & Authenticity Center (`safety-center`)**
   - Freshness & visible spoilage cues inspection, packaged label OCR, and expiry verification.
   - Integrated **Bangladesh Food Safety Authority (BFSA)** Laboratory Directory (9 official public reference labs across divisions/districts) and 16 official BFSA safety notices/alerts (`https://www.bfsa.gov.bd/`, `https://labrepository.bfsa.gov.bd/`).
   - Clear scientific boundary: visual inspection cannot prove chemical purity or replace accredited laboratory testing.

6. **Food Comparison System (`food-comparison`)**
   - Compare 2–3 foods side-by-side at equal gram weights (default 100g, adjustable 10g–1000g).
   - Presets including *Rice vs Roti*, *Apple vs Banana*, *Fish (Rohu) vs Egg*, and *Lentils vs Chickpeas*.
   - Visual SVG bar comparisons across calories, protein, carbs, fat, and fiber, plus full 21-nutrient table and saved comparison history.

7. **Food Waste Reduction AI (`food-waste`)**
   - Enter near-expiry items (with days remaining), cooked leftovers, available ingredients, and storage zone (`refrigerator`, `freezer`, `pantry`).
   - Automatically excludes expired perishables (`daysRemaining < 0`), prioritizes use-first cooking order, outputs zero-waste recipes with unique images, and explains **Use By** (safety limit) vs. **Best Before** (peak quality).

8. **Personal Food Journal (`food-journal`)**
   - Log meals by calendar date and meal slot (`breakfast`, `lunch`, `dinner`, `snack`) directly from the 389 BD FCTB dataset or custom entries.
   - Daily calorie/macro progress against target, interactive 7-day SVG history chart, CSV export, and entry/account clear controls.

9. **Interactive Food Assistant (`assistant`)**
   - Grounded in live lookups against `BD_FCT_DATABASE` and `BFSA_LABORATORY_DIRECTORY` with cited sources and clinical/laboratory disclaimers.

10. **Profile, Onboarding & Notifications (`profile`, `onboarding`)**
    - 3-step bilingual onboarding wizard, persistent user accounts (`scrypt`-hashed credentials, login, signup, password reset), and an interactive top-bar Notifications center.

---

## Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express (`server.ts`), Google GenAI SDK (`@google/genai` using `gemini-4-hydrogen`)
- **Database**: Structured persistent JSON store (`/server/db.ts` -> `/data/aahariq-db.json`) with salted `crypto.scryptSync` password hashing, token-based sessions, workspace isolation, `foodJournalEntries`, `foodComparisonHistory`, and `savedRecipes`.
- **Fonts**: `Plus Jakarta Sans`, `DM Sans`, `JetBrains Mono`

---

## Environment Variables (`.env.example`)

| Variable | Purpose |
| :--- | :--- |
| `GEMINI_API_KEY` | Server-side Google Gemini API key (`@google/genai`) |
| `PORT` | HTTP server port (defaults to `3000`) |

---

## Local Setup & Commands

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack dev server (Express + Vite middleware on port 3000)
npm run dev

# 3. Typecheck / Lint / Production build
npm run lint
npm run build
npm start
```

---

## API Endpoints Overview

- `GET /api/health` — Platform & database readiness status
- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `PUT /api/auth/profile`, `POST /api/auth/request-password-reset`, `POST /api/auth/reset-password`
- `POST /api/gemini/ingredient-recipes` — Bilingual ingredient normalization, strict main-ingredient matching & unique recipe images
- `POST /api/gemini/food-scanner` & `/api/food-scanner/barcode/:code` — Multimodal meal/produce/packaged scanning
- `POST /api/safety-center/inspect`, `GET /api/safety-center/bfsa/labs`, `GET /api/safety-center/bfsa/info`
- `GET /api/bd-nutrition/foods`, `GET /api/bd-nutrition/foods/:code`, `GET /api/bd-nutrition/guidelines`
- `POST /api/gemini/food-waste` — Near-expiry prioritization, shelf-life guide & zero-waste meal rescue
- `GET /api/journal/entries`, `POST /api/journal/entries`, `DELETE /api/journal/entries/:id`, `DELETE /api/journal/entries`
- `GET /api/comparisons`, `POST /api/comparisons`, `DELETE /api/comparisons/:id`
- `POST /api/gemini/chat` — BD FCTB & BFSA grounded assistant

---

## Known Limitations & Scientific Boundaries

- **Photo-Based Calorie Estimation**: AI vision estimates from images cannot know hidden cooking oil, sugar, or exact density without user weight input; AaharIQ surfaces estimation confidence and lets users edit food names and gram weights.
- **No Chemical Adulteration Proof from Images**: Visual checks can spot visible mold, discoloration, or damaged seals, **never** invisible chemical adulterants (e.g., formalin, heavy metals, pesticides). The Safety Center directs users to official BFSA-listed laboratories.
- **Offline Public Snapshots**: The included BFSA directory and Bangladesh FCTB datasets reflect curated public snapshots (`lastVerifiedDate` shown in UI) and should be cross-checked with `bfsa.gov.bd` for newly gazetted notices.
- **In-App Password Reset Verification**: Because sandbox environments lack an outbound SMTP relay, password reset issues a time-limited 6-digit verification code via an in-app verification flow.

---

## AI Congress Competition Summary

- **Problem**: Consumers in Bangladesh and South Asia face a fragmented food ecosystem—high kitchen food waste, limited nutrition literacy around local foods, confusion between raw vs. cooked values, and fear of food adulteration without actionable lab guidance.
- **Solution**: **AaharIQ** unifies bilingual ingredient-first cooking, INFS Bangladesh food composition science (389 foods + 2025 Dietary Guidelines), BFSA laboratory transparency, zero-waste inventory rescue, side-by-side nutrition comparison, and daily food journaling in a single accessible web platform.
- **Responsible AI & Integrity**: Refuses to fabricate missing micronutrients, blocks spoiled/expired food recommendations in waste rescue, refuses to guess chemical purity from photos, and keeps user credentials hashed server-side.
