create type public.app_role as enum ('admin','student');
create type public.request_status as enum ('submitted','under_review','quoted','awaiting_payment','in_progress','completed','cancelled');
create type public.payment_status as enum ('unpaid','pending','paid','refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  reg_number text, email text, phone text, country text, institution text, course text, year_of_study text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null, unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, reg_number, phone, country, institution, course, year_of_study)
  values (new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'reg_number', new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'institution', new.raw_user_meta_data->>'course', new.raw_user_meta_data->>'year_of_study');
  insert into public.user_roles (user_id, role) values (new.id, 'student');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null, description text not null default '',
  base_price numeric(10,2) not null default 0, unit text not null default 'per page',
  active boolean not null default true, sort int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "public read active services" on public.services for select to anon, authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "admin manage services" on public.services for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.services (name, description, base_price, unit, sort) values
('Tutoring Session','One-on-one guidance to help you understand difficult topics.',15,'per hour',1),
('Proofreading & Editing','Grammar, clarity, flow and style improvements to your own writing.',4,'per page',2),
('Research Guidance','Help finding credible sources and structuring your research.',8,'per page',3),
('Formatting & Referencing','APA, MLA, Harvard and Chicago formatting and citations.',3,'per page',4),
('Assignment Review','Detailed feedback on your draft before you submit.',6,'per page',5),
('Presentation Support','Slide design and structure feedback for your presentation.',5,'per slide',6);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique default ('REQ-' || upper(substr(md5(random()::text),1,6))),
  student_id uuid not null,
  service_id uuid references public.services(id),
  title text not null, course_unit text, lecturer text, description text not null default '',
  num_questions int, num_pages int, academic_level text,
  deadline timestamptz, preferred_date timestamptz,
  status request_status not null default 'submitted',
  payment_status payment_status not null default 'unpaid',
  price numeric(10,2), currency text not null default 'USD', admin_notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select, insert, update on public.requests to authenticated;
grant all on public.requests to service_role;
alter table public.requests enable row level security;
create policy "student read own" on public.requests for select to authenticated using (student_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "student create own" on public.requests for insert to authenticated with check (student_id = auth.uid() and status='submitted' and payment_status='unpaid' and price is null);
create policy "admin update" on public.requests for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.request_updates (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  status request_status, note text, created_by uuid,
  created_at timestamptz not null default now()
);
grant select, insert on public.request_updates to authenticated;
grant all on public.request_updates to service_role;
alter table public.request_updates enable row level security;
create policy "read updates" on public.request_updates for select to authenticated using (public.has_role(auth.uid(),'admin') or exists (select 1 from public.requests r where r.id=request_id and r.student_id=auth.uid()));
create policy "admin add updates" on public.request_updates for insert to authenticated with check (public.has_role(auth.uid(),'admin'));

create table public.request_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  uploaded_by uuid not null, path text not null, name text not null,
  kind text not null default 'submission', created_at timestamptz not null default now()
);
grant select, insert on public.request_files to authenticated;
grant all on public.request_files to service_role;
alter table public.request_files enable row level security;
create policy "read files" on public.request_files for select to authenticated using (public.has_role(auth.uid(),'admin') or exists (select 1 from public.requests r where r.id=request_id and r.student_id=auth.uid()));
create policy "add files" on public.request_files for insert to authenticated with check (uploaded_by=auth.uid() and (public.has_role(auth.uid(),'admin') or (kind='submission' and exists (select 1 from public.requests r where r.id=request_id and r.student_id=auth.uid()))));

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path=public as $$ begin new.updated_at = now(); return new; end $$;
create trigger t_req before update on public.requests for each row execute function public.touch_updated_at();
create trigger t_prof before update on public.profiles for each row execute function public.touch_updated_at();

create policy "own folder upload" on storage.objects for insert to authenticated with check (bucket_id='assignment-files' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(),'admin')));
create policy "own folder read" on storage.objects for select to authenticated using (bucket_id='assignment-files' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(),'admin') or exists (select 1 from public.request_files f join public.requests r on r.id=f.request_id where f.path = storage.objects.name and r.student_id = auth.uid())));