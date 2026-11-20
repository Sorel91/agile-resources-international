create table public.ari_training_events (
  id integer primary key check (id = 1),
  title varchar(180) not null,
  event_date date not null,
  start_time varchar(5) not null default '' check (start_time = '' or start_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  duration_minutes integer check (duration_minutes between 15 and 1440),
  location varchar(500) not null default '',
  format_mode varchar(16) not null default 'pending' check (format_mode in ('pending','single','workshops'))
);
create table public.ari_training_registrations (
  id bigint generated always as identity primary key,
  event_id integer not null default 1 references public.ari_training_events(id),
  full_name varchar(160) not null check (length(full_name) >= 2),
  email varchar(254) not null,
  phone varchar(40) not null,
  situation varchar(100) not null default '',
  topics_json jsonb not null check (
    jsonb_typeof(topics_json) = 'array' and jsonb_array_length(topics_json) between 1 and 3
    and topics_json <@ '["network","profile","interview"]'::jsonb
  ),
  status varchar(16) not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  cv_file varchar(68) check (cv_file is null or cv_file ~ '^[a-f0-9]{64}\.pdf$'),
  consent_version varchar(64) not null,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(event_id, email),
  check (email = lower(email))
);
create index on public.ari_training_registrations(event_id,status);
create table public.ari_training_admin_keys (
  key_id text primary key check (key_id ~ '^[a-f0-9]{64}$'),
  public_key text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.ari_training_nonces (
  key_id text not null references public.ari_training_admin_keys(key_id),
  nonce text not null check (nonce ~ '^[a-f0-9]{32}$'),
  created_at timestamptz not null default now(),
  primary key(key_id,nonce)
);
create index on public.ari_training_nonces(created_at);
alter table public.ari_training_events enable row level security;
alter table public.ari_training_registrations enable row level security;
alter table public.ari_training_admin_keys enable row level security;
alter table public.ari_training_nonces enable row level security;
revoke all on public.ari_training_events, public.ari_training_registrations,
  public.ari_training_admin_keys, public.ari_training_nonces from anon, authenticated;
grant all on public.ari_training_events, public.ari_training_registrations,
  public.ari_training_admin_keys, public.ari_training_nonces to service_role;
grant usage, select on sequence public.ari_training_registrations_id_seq to service_role;
insert into public.ari_training_events(id,title,event_date) values (1,'Ateliers carrière — Agile Resources','2026-11-21');
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('ari-training-cvs','ari-training-cvs',false,5242880,array['application/pdf']);

create function public.ari_training_search(p_query text default '', p_status text default '', p_offset integer default 0)
returns setof public.ari_training_registrations
language sql stable security invoker set search_path = ''
as $$
  select r.* from public.ari_training_registrations r
  where r.event_id = 1
    and (p_status = '' or r.status = p_status)
    and (p_query = '' or position(lower(p_query) in lower(r.full_name || ' ' || r.email || ' ' || r.phone)) > 0)
  order by r.created_at, r.id
  limit 500 offset greatest(p_offset,0)
$$;
revoke all on function public.ari_training_search(text,text,integer) from public, anon, authenticated;
grant execute on function public.ari_training_search(text,text,integer) to service_role;