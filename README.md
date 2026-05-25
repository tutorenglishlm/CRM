# TutorEnglishLM CRM

Sistema de gestión para el Curso Intensivo de Inglés — Verano 2025.

## Stack
- **Next.js 14** (App Router)
- **Supabase** (database + auth)
- **Tailwind CSS**
- **Vercel** (deployment)

## Routes
| URL | Description |
|---|---|
| `/inscripcion` | Public registration form for parents |
| `/login` | Admin login |
| `/admin` | Dashboard |
| `/admin/students` | Student records |
| `/admin/registrations` | Registration log |
| `/admin/financials` | Financial overview |

---

## Setup — Step by Step

### 1. Supabase

1. Go to [supabase.com](https://supabase.com) and open your project.
2. Go to **SQL Editor** and paste the entire contents of `supabase/schema.sql`. Run it.
3. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public` key

### 2. Local environment

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. Install and run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Create your first admin user

1. Go to your Supabase project → **Authentication → Users**
2. Click **Add user** → **Create new user**
3. Enter email and password for each admin (up to 5)
4. That's it — they can log in at `/login`

### 5. Deploy to Vercel

1. Push this repo to GitHub:
```bash
git init
git add .
git commit -m "Initial commit — TutorEnglishLM CRM"
git remote add origin https://github.com/YOUR_USERNAME/tutorenglishlm-crm.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy** — done.

---

## How the public form works

Parents visit `/inscripcion`, fill out the form, and submit. The data is saved directly to Supabase without requiring any login. Admins can view all submissions in the CRM.

## Adding team members

Just create additional users in Supabase Auth (step 4 above). No code changes needed.
