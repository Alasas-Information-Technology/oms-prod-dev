-- DEIZ OMS: Supabase Initial Schema & RBAC Policies
-- Run this directly in the Supabase SQL Editor.

-- 1. Custom Types
CREATE TYPE public.app_role AS ENUM (
  'HR_ADMIN',
  'HOD',
  'DEPT_REQUESTOR',
  'PROCUREMENT_OFFICER',
  'FINANCE_OFFICER',
  'SYSTEM_ADMIN',
  'VENDOR_USER'
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
  stage_id integer REFERENCES public.workflow_stages(stage_id) DEFAULT 1,
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
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'hr.manager@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"HR Manager","role":"HR_ADMIN"}', now(), now()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'hod.operations@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"HOD Operations","role":"HOD"}', now(), now()),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'requestor.it@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"IT Requestor","role":"DEPT_REQUESTOR"}', now(), now()),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'lm.finance@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Finance LM","role":"FINANCE_OFFICER"}', now(), now()),
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'procurement@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Procurement Officer","role":"PROCUREMENT_OFFICER"}', now(), now()),
  ('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000', 'finance.analyst@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Finance Analyst","role":"FINANCE_OFFICER"}', now(), now()),
  ('77777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'interviewer.hr@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Main Interviewer","role":"DEPT_REQUESTOR"}', now(), now()),
  ('88888888-8888-8888-8888-888888888888', '00000000-0000-0000-0000-000000000000', 'sysadmin@deiz.ae', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"System Admin","role":"SYSTEM_ADMIN"}', now(), now());

-- (Optional) If the Trigger didn't fire, manually seed the public.profiles table:
INSERT INTO public.profiles (id, email, full_name, department, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'hr.manager@deiz.ae', 'HR Manager', 'Human Resources', 'HR_ADMIN'),
  ('22222222-2222-2222-2222-222222222222', 'hod.operations@deiz.ae', 'HOD Operations', 'Operations', 'HOD'),
  ('33333333-3333-3333-3333-333333333333', 'requestor.it@deiz.ae', 'IT Requestor', 'Information Technology', 'DEPT_REQUESTOR'),
  ('44444444-4444-4444-4444-444444444444', 'lm.finance@deiz.ae', 'Finance Manager', 'Finance', 'FINANCE_OFFICER'),
  ('55555555-5555-5555-5555-555555555555', 'procurement@deiz.ae', 'Procurement Officer', 'Procurement', 'PROCUREMENT_OFFICER'),
  ('66666666-6666-6666-6666-666666666666', 'finance.analyst@deiz.ae', 'Finance Analyst', 'Finance', 'FINANCE_OFFICER'),
  ('77777777-7777-7777-7777-777777777777', 'interviewer.hr@deiz.ae', 'Main Interviewer', 'Human Resources', 'DEPT_REQUESTOR'),
  ('88888888-8888-8888-8888-888888888888', 'sysadmin@deiz.ae', 'System Administrator', 'IT Administration', 'SYSTEM_ADMIN')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 7. Nomalized Master RBAC & Workflows
-- ==============================================================================

-- 7.1 Roles Master Table
CREATE TABLE public.roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);

INSERT INTO public.roles (role_name, description) VALUES 
('SYSTEM_ADMIN', 'Maintains technical integrity and API integrations'),
('DEPT_REQUESTOR', 'Initiates manpower requisitions and defines specs'),
('HOD', 'Exercises executive authority and locks funds'),
('HR_ADMIN', 'Enterprise policy gatekeeper and Emiratisation monitor'),
('PROCUREMENT_OFFICER', 'Manages vendor ecosystem and LPO generation'),
('FINANCE_OFFICER', 'Maintains macroeconomic stability and budget parameters'),
('VENDOR_USER', 'External portal user for CV and rate submission');

-- 7.2 Core Permissions Table
CREATE TABLE public.permissions (
  permission_id SERIAL PRIMARY KEY,
  permission_code VARCHAR(50) UNIQUE NOT NULL,
  permission_name VARCHAR(255) NOT NULL
);

INSERT INTO public.permissions (permission_code, permission_name) VALUES 
('REQ_CREATE', 'Create New Manpower Requisition'),
('BUDGET_LOCK', 'Lock and Allocate Departmental Funds'),
('CV_VIEW_BLIND', 'Review CVs with Masked Vendor Identities'),
('CV_VIEW_FULL', 'View Full Candidate and Vendor Financial Details'),
('BUDGET_AMEND', 'Approve Unbudgeted or Overage Requests'),
('LPO_GENERATE', 'Finalize Commercial Onboarding and LPOs'),
('COMPLIANCE_VERIFY', 'Validate Passports, Emirates IDs, and NDAs'),
('PORTAL_EXTERNAL', 'Access Restricted Vendor Portal');

-- 7.3 Mapping Permissions to Roles (RolePermissions)
CREATE TABLE public.role_permissions (
  role_id INTEGER REFERENCES public.roles(role_id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES public.permissions(permission_id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- HOD Permissions
INSERT INTO public.role_permissions (role_id, permission_id) 
SELECT r.role_id, p.permission_id FROM public.roles r, public.permissions p 
WHERE r.role_name = 'HOD' AND p.permission_code IN ('BUDGET_LOCK', 'REQ_CREATE');

-- Procurement Permissions
INSERT INTO public.role_permissions (role_id, permission_id) 
SELECT r.role_id, p.permission_id FROM public.roles r, public.permissions p 
WHERE r.role_name = 'PROCUREMENT_OFFICER' AND p.permission_code IN ('CV_VIEW_FULL', 'LPO_GENERATE', 'COMPLIANCE_VERIFY');

-- Requestor/Interviewer
INSERT INTO public.role_permissions (role_id, permission_id) 
SELECT r.role_id, p.permission_id FROM public.roles r, public.permissions p 
WHERE r.role_name = 'DEPT_REQUESTOR' AND p.permission_code IN ('REQ_CREATE', 'CV_VIEW_BLIND');

-- 7.4 Workflow Stages Configuration
CREATE TABLE public.workflow_stages (
  stage_id INTEGER PRIMARY KEY,
  stage_name VARCHAR(100) NOT NULL,
  required_role_id INTEGER REFERENCES public.roles(role_id)
);

INSERT INTO public.workflow_stages (stage_id, stage_name, required_role_id) VALUES 
(1, 'Requisition Generation', (SELECT role_id FROM public.roles WHERE role_name = 'DEPT_REQUESTOR')),
(2, 'Hierarchical & HR Approval', (SELECT role_id FROM public.roles WHERE role_name = 'HR_ADMIN')),
(5, 'Blind Candidate Selection', (SELECT role_id FROM public.roles WHERE role_name = 'DEPT_REQUESTOR')),
(7, 'Budget Amendment Protocol', (SELECT role_id FROM public.roles WHERE role_name = 'FINANCE_OFFICER')),
(8, 'Digital Onboarding', (SELECT role_id FROM public.roles WHERE role_name = 'VENDOR_USER'));

-- ==============================================================================
-- 8. Recruiting & Governance Extensions
-- ==============================================================================

-- 8.1 Candidates Table
CREATE TABLE public.candidates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  requisition_id uuid REFERENCES public.requisitions(id) ON DELETE CASCADE NOT NULL,
  alias text NOT NULL,
  total_years_experience integer DEFAULT 0,
  top_skills text[] DEFAULT '{}',
  education_level text,
  priority_ranking text,
  status text DEFAULT 'PENDING_REVIEW',
  vendor_id uuid REFERENCES public.profiles(id),
  financial_quote_aed numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8.2 Audit Logs Table (Existing)
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4 (),
  requisition_id uuid NULL,
  actor_id uuid NULL,
  action_type CHARACTER VARYING(100) NOT NULL,
  old_stage_id INTEGER NULL,
  new_stage_id INTEGER NULL,
  comments TEXT NULL,
  cryptographic_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users (id),
  CONSTRAINT audit_logs_requisition_id_fkey FOREIGN KEY (requisition_id) REFERENCES public.requisitions (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 8.3 RLS Policies for New Tables
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal users can view candidates" 
ON public.candidates FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'VENDOR'
);

CREATE POLICY "Internal users can view audit logs" 
ON public.audit_logs FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'VENDOR'
);

-- 8.4 RPC for Atomic Stage Advancement & Logging
CREATE OR REPLACE FUNCTION public.advance_requisition_stage(
  p_req_id uuid,
  p_current_stage_id integer,
  p_actor_id uuid
) RETURNS void AS $$
BEGIN
  -- Update Requisition Stage
  UPDATE public.requisitions
  SET stage_id = p_current_stage_id + 1
  WHERE id = p_req_id;

  -- Insert Audit Log
  INSERT INTO public.audit_logs (requisition_id, actor_id, action_type, old_stage_id, new_stage_id)
  VALUES (p_req_id, p_actor_id, 'STAGE_ADVANCED', p_current_stage_id, p_current_stage_id + 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
