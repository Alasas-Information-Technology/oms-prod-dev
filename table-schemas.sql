create table public.audit_logs (
  id uuid not null default extensions.uuid_generate_v4 (),
  requisition_id uuid null,
  actor_id uuid null,
  action_type character varying(100) not null,
  old_stage_id integer null,
  new_stage_id integer null,
  comments text null,
  cryptographic_timestamp timestamp with time zone not null default now(),
  constraint audit_logs_pkey primary key (id),
  constraint audit_logs_actor_id_fkey foreign KEY (actor_id) references auth.users (id),
  constraint audit_logs_requisition_id_fkey foreign KEY (requisition_id) references requisitions (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.candidates (
  id uuid not null default extensions.uuid_generate_v4 (),
  requisition_id uuid not null,
  vendor_id uuid not null,
  alias character varying(100) not null,
  total_years_experience numeric(4, 1) null,
  top_skills text[] null,
  education_level character varying(255) null,
  financial_quote_aed numeric(12, 2) not null,
  priority_ranking public.priority_rank null,
  status public.candidate_status null default 'SUBMITTED'::candidate_status,
  created_at timestamp with time zone null default now(),
  constraint candidates_pkey primary key (id),
  constraint candidates_requisition_id_fkey foreign KEY (requisition_id) references requisitions (id) on delete CASCADE,
  constraint candidates_vendor_id_fkey foreign KEY (vendor_id) references vendors (id)
) TABLESPACE pg_default;

create table public.interviews (
  id uuid not null default extensions.uuid_generate_v4 (),
  candidate_id uuid not null,
  main_interviewer_id uuid not null,
  scheduled_time timestamp with time zone not null,
  meeting_link character varying(255) null,
  feedback_notes text null,
  created_at timestamp with time zone null default now(),
  constraint interviews_pkey primary key (id),
  constraint interviews_candidate_id_fkey foreign KEY (candidate_id) references candidates (id) on delete CASCADE,
  constraint interviews_main_interviewer_id_fkey foreign KEY (main_interviewer_id) references profiles (id)
) TABLESPACE pg_default;

create table public.permissions (
  permission_id serial not null,
  permission_code character varying(50) not null,
  permission_name character varying(255) not null,
  constraint permissions_pkey primary key (permission_id),
  constraint permissions_permission_code_key unique (permission_code)
) TABLESPACE pg_default;

create table public.profiles (
  id uuid not null,
  role public.app_role not null default 'REQUESTOR'::app_role,
  email text not null,
  full_name text null,
  department text null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  role_id integer null,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_role_id_fkey foreign KEY (role_id) references roles (role_id)
) TABLESPACE pg_default;

create table public.requisitions (
  id uuid not null default extensions.uuid_generate_v4 (),
  req_number character varying(50) not null,
  position_title character varying(255) not null,
  department text not null,
  requestor_id uuid not null,
  target_start_date date not null,
  work_location character varying(50) not null,
  seating_accommodations text null,
  req_laptop boolean null default false,
  req_mobile boolean null default false,
  req_email boolean null default false,
  req_software text null,
  funding_category public.funding_type not null,
  reserved_budget_aed numeric(12, 2) not null,
  stage_id integer null default 1,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  req_mobile_phone boolean null default false,
  req_email_access boolean null default false,
  req_software_licenses boolean null default false,
  office_seating text null,
  funding_type text null,
  constraint requisitions_pkey primary key (id),
  constraint requisitions_req_number_key unique (req_number),
  constraint requisitions_requestor_id_fkey foreign KEY (requestor_id) references profiles (id),
  constraint requisitions_stage_id_fkey foreign KEY (stage_id) references workflow_stages (stage_id),
  constraint requisitions_work_location_check check (
    (
      (work_location)::text = any (
        (
          array[
            'Onshore'::character varying,
            'Offshore'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create table public.role_permissions (
  role_id integer not null,
  permission_id integer not null,
  constraint role_permissions_pkey primary key (role_id, permission_id),
  constraint role_permissions_permission_id_fkey foreign KEY (permission_id) references permissions (permission_id) on delete CASCADE,
  constraint role_permissions_role_id_fkey foreign KEY (role_id) references roles (role_id) on delete CASCADE
) TABLESPACE pg_default;


create table public.roles (
  role_id serial not null,
  role_name character varying(50) not null,
  description text null,
  constraint roles_pkey primary key (role_id),
  constraint roles_role_name_key unique (role_name)
) TABLESPACE pg_default;

create table public.vendors (
  id uuid not null default extensions.uuid_generate_v4 (),
  company_name character varying(255) not null,
  portal_access_email character varying(255) not null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint vendors_pkey primary key (id),
  constraint vendors_portal_access_email_key unique (portal_access_email)
) TABLESPACE pg_default;

create table public.workflow_stages (
  stage_id integer not null,
  stage_name character varying(100) not null,
  required_role_id integer null,
  constraint workflow_stages_pkey primary key (stage_id),
  constraint workflow_stages_required_role_id_fkey foreign KEY (required_role_id) references roles (role_id)
) TABLESPACE pg_default;