# Jobale Engineering PLC — Full-Stack Corporate Website & Admin CMS

A full-stack corporate web application and custom Content Management System (CMS) designed specifically for **Jobale Engineering PLC**, a general construction and civil engineering firm based in Adama, Ethiopia.

The project combines an animated corporate public website with a secure, branded Admin Dashboard allowing the company owner to manage every section of the website in real time.

---

## Architecture Overview

```
project/
├── backend/                         # Django REST Framework Backend
│   ├── apps/
│   │   ├── accounts/                # JWT Auth, cookie auth, Superuser guards
│   │   ├── cms/                     # Hero, About, Quality, SEO, Contact, Audit, Inquiries
│   │   ├── services/                # Engineering services CRUD & ordering
│   │   ├── projects/                # Projects, categories, scope, gallery
│   │   └── media_library/           # Secure asset uploads, usage tracking
│   ├── config/                      # Django project settings & URL routers
│   ├── db.sqlite3                   # Default SQLite database
│   ├── manage.py
│   └── requirements.txt             # Python dependencies
│
└── src/                             # React 18 + Vite + Tailwind CSS Frontend
    ├── components/
    │   ├── admin/                   # AdminLayout, Sidebar, Modals, Pickers, Header
    │   └── ...                      # Header, Footer, Hero, ConstructionIntro, GSAP
    ├── context/
    │   ├── AuthContext.tsx          # JWT authentication session provider
    │   ├── CmsContext.tsx           # Dynamic homepage & company data provider
    │   └── ToastContext.tsx         # Notification alerts
    ├── pages/
    │   ├── admin/                   # 14 dedicated section managers & login portal
    │   └── ...                      # Public pages (Home, About, Services, Projects, etc.)
    ├── lib/                         # api.ts (DRF client), icons.ts, types.ts
    └── data/                        # Verified company fallback datasets
```

---

## Technology Stack

- **Backend**: Python 3.11+, Django 5.1+, Django REST Framework 3.15+, SimpleJWT, Pillow, SQLite (default), CORS headers.
- **Frontend**: React 18, Vite 5, Tailwind CSS, GSAP, Framer Motion, Lucide React, React Router 6.
- **Security**: HttpOnly cookie JWT + Bearer fallback in memory (no persistent localStorage token leaks), Django password hashing, CSRF protection, file upload validation.

---

## Getting Started

### 1. Prerequisites

- Python 3.10+ installed
- Node.js 18+ and npm installed

### 2. Backend Setup (Django REST Framework)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run database migrations:
   ```bash
   python manage.py migrate
   ```

4. Seed verified company content (Hero, Services, Projects, About, Quality):
   ```bash
   python manage.py seed_cms_content
   ```

5. (Optional) Create an additional superuser if needed:
   ```bash
   python manage.py createsuperuser
   ```

6. Start the Django API server:
   ```bash
   python manage.py runserver 8000
   ```
   *The backend will be running at `http://localhost:8000/`.*

### 3. Frontend Setup (React + Vite)

1. Open a new terminal in the project root:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   *The public website will be available at `http://localhost:5173/`.*

---

## Admin Portal & Credentials

### Accessing the Dashboard

- **Login Route**: [`/admin/login`](http://localhost:5173/admin/login)
- **Admin Dashboard**: [`/admin`](http://localhost:5173/admin)

### Default Administrator Credentials

- **Username / Email**: `admin` or `civiljob12@gmail.com`
- **Password**: `Jobale@2026!Admin`

*(The administrator can change their password anytime via `/admin/account`)*

---

## Admin CMS Features

1. **Dashboard Overview**: Real statistics (published projects, active services, sections, media count, last update) and live audit log of recent staff activity.
2. **Global Website Settings**: Manage company name, legal title, logos (light & dark), brand colors, footer copyright, and social media handles.
3. **Hero Section Editor**: Live interactive preview matching public styling, editable eyebrow, headline, accent text, primary & secondary CTAs, blueprint animation toggle, and overlay slider.
4. **About Us Editor**: Edit company overview, mission, vision, structured core values, and background history.
5. **Services Manager**: Full CRUD, slug configuration, Lucide icon selector, scope list builder, featured toggle, and instant publish/draft states.
6. **Projects & Portfolio**: Add and edit projects, categories, specifications, scope items, client names, completion dates, and multiple gallery images.
7. **Clients & References**: Manage client associations, logos, and internal audit notes.
8. **Quality & Safety Editor**: Manage commitments, QA policies, and verified certifications (issuing body, certificate numbers, validity dates).
9. **Testimonials Manager**: Manage verified customer testimonials. Shows a clean empty state when no unverified testimonials exist.
10. **Contact Information Manager**: Update office phone, email, address, business hours, and embed Google Maps. Displays a real-time log of customer project inquiries.
11. **Navigation & Footer Manager**: Reorder menu items, toggle visibility, and update footer quick-links.
12. **Media Library**: Upload and search images, copy public URLs, and perform safety checks preventing accidental deletion of in-use media.
13. **Page SEO Settings**: Open Graph preview card, Google Search SERP simulation, meta descriptions, and keywords.
14. **Sections Registry**: Enable or disable whole sections with one click.
15. **Account & Settings**: Change password and view system diagnostics.

---

## Public Website Dynamic Integration & Fallback

All public routes retrieve data from `/api/v1/homepage/` and detail endpoints:
- [`/`](http://localhost:5173/) — Dynamic Hero, Services grid, Featured Projects, Core Stats, and Testimonials.
- [`/about`](http://localhost:5173/about) — Dynamic Overview, Mission, Vision, and Core Values.
- [`/services`](http://localhost:5173/services) — Dynamic Services list with Lucide icons.
- [`/services/:slug`](http://localhost:5173/services/building-construction) — Detailed scope, applications, approach, and related projects.
- [`/projects`](http://localhost:5173/projects) — Dynamic portfolio with category filtering and search.
- [`/projects/:slug`](http://localhost:5173/projects/lemi-national-cement-factory) — Full scope, technical specs, and photo gallery.
- [`/quality-safety`](http://localhost:5173/quality-safety) — Commitments and verified certifications.
- [`/contact`](http://localhost:5173/contact) — Dynamic contact numbers, map embed, and a working project inquiry form that validates and persists submissions to `POST /api/v1/contact/inquiries/`.

**Graceful Offline Fallback**: If the backend is temporarily offline or loading, the public website automatically and seamlessly falls back to verified static data with zero layout shift or broken UI.

---

## Automated Testing & Code Quality

### Backend Tests (Django)

Run the full Django test suite (54 comprehensive test cases covering authentication, drafts/publishing, permissions, media validation, inquiry submission, and singleton handling):
```bash
cd backend
python manage.py test
```
*Result: 54/54 tests passing.*

### Frontend Typecheck & Build

Run the TypeScript typecheck:
```bash
npm run typecheck
```
*Result: 0 errors.*

Run the Vite production build:
```bash
npm run build
```
*Result: Bundle built cleanly.*
