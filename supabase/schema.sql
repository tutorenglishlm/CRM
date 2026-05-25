-- ============================================
-- TutorEnglishLM CRM — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Parents / Tutors
create table parents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  created_at timestamptz default now()
);

-- Students
create table students (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references parents(id) on delete cascade,
  name text not null,
  age int not null,
  level text not null check (level in ('basic', 'intermediate', 'advanced')),
  notes text,
  created_at timestamptz default now()
);

-- Registrations
create table registrations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  parent_id uuid references parents(id) on delete cascade,
  status text default 'active' check (status in ('active', 'inactive', 'completed')),
  payment_status text default 'pending' check (payment_status in ('paid', 'partial', 'pending')),
  payment_method text check (payment_method in ('cash', 'transfer')),
  created_at timestamptz default now()
);

-- Payments (inscripcion fee, course fee, and expenses)
create table payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete set null,
  registration_id uuid references registrations(id) on delete set null,
  type text not null check (type in ('inscripcion', 'course', 'expense')),
  amount numeric(10,2) not null,
  paid boolean default false,
  payment_method text check (payment_method in ('cash', 'transfer')),
  notes text,
  created_at timestamptz default now()
);

-- ============================================
-- Row Level Security
-- ============================================

alter table parents enable row level security;
alter table students enable row level security;
alter table registrations enable row level security;
alter table payments enable row level security;

-- Public can insert (for the registration form)
create policy "Public can insert parents" on parents for insert with check (true);
create policy "Public can insert students" on students for insert with check (true);
create policy "Public can insert registrations" on registrations for insert with check (true);
create policy "Public can insert payments" on payments for insert with check (true);

-- Only authenticated admins can read/update/delete
create policy "Admins can read parents" on parents for select using (auth.role() = 'authenticated');
create policy "Admins can update parents" on parents for update using (auth.role() = 'authenticated');
create policy "Admins can delete parents" on parents for delete using (auth.role() = 'authenticated');

create policy "Admins can read students" on students for select using (auth.role() = 'authenticated');
create policy "Admins can update students" on students for update using (auth.role() = 'authenticated');
create policy "Admins can delete students" on students for delete using (auth.role() = 'authenticated');

create policy "Admins can read registrations" on registrations for select using (auth.role() = 'authenticated');
create policy "Admins can update registrations" on registrations for update using (auth.role() = 'authenticated');
create policy "Admins can delete registrations" on registrations for delete using (auth.role() = 'authenticated');

create policy "Admins can read payments" on payments for select using (auth.role() = 'authenticated');
create policy "Admins can update payments" on payments for update using (auth.role() = 'authenticated');
create policy "Admins can delete payments" on payments for delete using (auth.role() = 'authenticated');
