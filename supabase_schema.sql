-- DEIZ OMS: Supabase Initial Schema & RBAC Policies
-- Run this directly in the Supabase SQL Editor.

-- 1. Custom Types
CREATE TYPE public.app_role AS ENUM (
  'HR',
  'HOD',
  'REQUESTOR',
  'LINE_MANAGER',
  'PROCUREMENT',
  'FINANCE',
  'INTERVIEWER',
  'ADMIN',
  'VENDOR'
);

-- 2. Profiles Table: Extends auth.users
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  role public.app_role DEFAULT 'REQUESTOR'::public.app_role NOT NULL,
  email text NOT NULL,
  full_name text,
  department text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn On Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for Profiles
-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);

-- 4. Requisitions Table (Example)
CREATE TABLE public.requisitions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  req_id text UNIQUE NOT NULL,
  title text NOT NULL,
  department text NOT NULL,
  requestor_id uuid REFERENCES public.profiles(id) NOT NULL,
  stage text NOT NULL,
  budget_aed numeric DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.requisitions ENABLE ROW LEVEL SECURITY;

-- Requisitions Constraints Based on Role
-- Everyone can view Requisitions generally (if they have an internal role)
CREATE POLICY "Internal Users can view requisitions"
ON public.requisitions FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'VENDOR'
);

-- Only HR, ADMIN, and REQUESTOR can insert Requisitions
CREATE POLICY "Authorized roles can create requisitions"
ON public.requisitions FOR INSERT WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('REQUESTOR', 'HR', 'ADMIN')
);

-- 5. Trigger Functions
-- Automatically create profile entry when a new auth user is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::public.app_role, 'REQUESTOR'::public.app_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Mock Data (Seeding for Local Testing)
-- The following inserts explicitly seed the 'auth.users' table with dummy records,
-- and then populates the corresponding 'public.profiles' table to match your 8 demo accounts.
-- NOTE: In a real production environment, you would use the Supabase Auth API to generate users,
-- which would automatically trigger the 'handle_new_user' function.

-- Insert 8 Dummy Users into auth.users 
-- (requires uuid-ossp extension which is default in supabase)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'hr.manager@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"HR Manager","role":"HR"}', now(), now()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'hod.operations@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"HOD Operations","role":"HOD"}', now(), now()),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'requestor.it@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"IT Requestor","role":"REQUESTOR"}', now(), now()),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'lm.finance@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Finance LM","role":"LINE_MANAGER"}', now(), now()),
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'procurement@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Procurement Officer","role":"PROCUREMENT"}', now(), now()),
  ('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000', 'finance.analyst@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Finance Analyst","role":"FINANCE"}', now(), now()),
  ('77777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'interviewer.hr@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Main Interviewer","role":"INTERVIEWER"}', now(), now()),
  ('88888888-8888-8888-8888-888888888888', '00000000-0000-0000-0000-000000000000', 'sysadmin@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"System Admin","role":"ADMIN"}', now(), now());

-- (Optional) If the Trigger didn't fire, manually seed the public.profiles table:
INSERT INTO public.profiles (id, email, full_name, department, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'hr.manager@deiz.ae', 'HR Manager', 'Human Resources', 'HR'),
  ('22222222-2222-2222-2222-222222222222', 'hod.operations@deiz.ae', 'HOD Operations', 'Operations', 'HOD'),
  ('33333333-3333-3333-3333-333333333333', 'requestor.it@deiz.ae', 'IT Requestor', 'Information Technology', 'REQUESTOR'),
  ('44444444-4444-4444-4444-444444444444', 'lm.finance@deiz.ae', 'Finance Manager', 'Finance', 'LINE_MANAGER'),
  ('55555555-5555-5555-5555-555555555555', 'procurement@deiz.ae', 'Procurement Officer', 'Procurement', 'PROCUREMENT'),
  ('66666666-6666-6666-6666-666666666666', 'finance.analyst@deiz.ae', 'Finance Analyst', 'Finance', 'FINANCE'),
  ('77777777-7777-7777-7777-777777777777', 'interviewer.hr@deiz.ae', 'Main Interviewer', 'Human Resources', 'INTERVIEWER'),
  ('88888888-8888-8888-8888-888888888888', 'sysadmin@deiz.ae', 'System Administrator', 'IT Administration', 'ADMIN')
ON CONFLICT (id) DO NOTHING;
