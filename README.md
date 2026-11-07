# BloodConnect — Mysuru District Blood Donation Platform

> **Serving Mysuru District, Karnataka Only.**  
> *Every Drop Counts. Every Connection Matters.*

BloodConnect is a location-restricted voluntary blood donor connection and emergency blood request coordination platform engineered exclusively for **Mysuru District, Karnataka, India**. It directly bridges voluntary blood donors, patients/family representatives, and verified hospitals while strictly safeguarding donor privacy, enforcing affirmative two-party consent, and blocking out-of-district submissions through server-side geospatial point-in-polygon verification.

---

## 1. Absolute Geographical Restriction — Mysuru District, Karnataka Only

The platform enforces system-level boundary validation:
- **Perimeter Coverage:** All 9 taluks of Mysuru district:
  1. Mysuru City & Rural
  2. Tirumakudalu Narasipura (T. Narasipura)
  3. Nanjangud
  4. Heggadadevanakote (H.D. Kote)
  5. Hunsur
  6. Piriyapatna
  7. Krishnarajanagara (K.R. Nagar)
  8. Sargur
  9. Saligrama
- **Server & Client Ray-Casting Algorithm:** Coordinates submitted via registrations or blood requests are tested against the authoritative Mysuru district boundary polygon. Any coordinates outside the district (e.g., Bengaluru, Mandya, Chamarajanagar, Kerala/Wayanad) are rejected with:  
  `"BloodConnect is currently available only within Mysuru district, Karnataka."`
- **PostgreSQL Database Constraint:** Enforced via `is_within_mysuru_district(lat, lng)` database CHECK constraints on `donor_profiles`, `blood_requests`, and `hospitals` tables.

---

## 2. Technology Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **Geospatial Maps:** Leaflet + OpenStreetMap
- **Database & Auth:** Supabase PostgreSQL + Row Level Security (RLS)
- **State & Storage:** Resilient Dual-Mode Client (`@supabase/supabase-js` with graceful local storage fallback for standalone review)

---

## 3. Database Schema & Security Architecture

The full schema migration is located in `supabase/schema.sql` and includes:
- `profiles`: User accounts linked with Supabase Auth
- `donor_profiles`: Blood group, birth date, Mysuru location, availability status, consent preferences
- `blood_requests`: Patient blood group, units, hospital details, Mysuru coordinates, status
- `donor_responses`: Donor accept/decline decisions and explicit contact-sharing authorizations
- `hospitals`: Verified district healthcare facilities and blood banks
- `notifications`: In-app event-driven messaging
- `audit_logs`: Immutable security and administrative action audit trail

### Row Level Security (RLS) Rules:
- Donors can read and update only their own profile.
- Seekers can manage only their own requests.
- Donor contact details (phone, exact residential street address) are **shielded from public queries** and unlocked only when the donor explicitly accepts a request and authorizes contact sharing.
- Administrators are authenticated server-side; public self-assignment of administrator privileges is strictly blocked.

---

## 4. Preliminary ABO/Rh Red-Cell Compatibility Reference

| Patient Blood Group | Compatible Potential Donor Groups |
|---|---|
| **A+** | A+, A-, O+, O- |
| **A-** | A-, O- |
| **B+** | B+, B-, O+, O- |
| **B-** | B-, O- |
| **AB+** | All eight groups (Universal Recipient) |
| **AB-** | AB-, A-, B-, O- |
| **O+** | O+, O- |
| **O-** | O- (Universal Red-Cell Donor) |

> **Statutory Medical Notice:**  
> *"Preliminary matching filter for potential red-cell donors. Final donor suitability and blood compatibility must be confirmed by the hospital or authorized blood bank."*

---

## 5. Local Development Setup

1. **Clone and Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables (Optional for Supabase):**
   Copy `.env.example` to `.env`:
   ```env
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   VITE_ENFORCE_MYSURU_DISTRICT_ONLY="true"
   ```
   *Note: If Supabase credentials are not configured, BloodConnect automatically operates in safe local demonstration mode with pre-seeded Mysuru hospitals and demo accounts.*

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

4. **Run Automated Tests:**
   ```bash
   npm test
   ```

---

## 6. Pre-Configured Demo Accounts (For Testing & Review)

- **Blood Seeker:** `seeker@mysuru.org`
- **Voluntary Donor (O+):** `donor@mysuru.org`
- **Voluntary Donor (A+):** `priya@mysuru.org`
- **District Health Administrator:** `admin@bloodconnect.gov.in`

Use the quick switcher toolbar at the top of the interface to toggle between roles and test the complete end-to-end matching and contact revelation workflow.
