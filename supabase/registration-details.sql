alter table public.ari_training_registrations
  add column first_name varchar(80) not null default '',
  add column last_name varchar(80) not null default '',
  add column city varchar(120) not null default '',
  add column residence_country varchar(100) not null default '',
  add column education_domain varchar(180) not null default '';
alter table public.ari_training_registrations alter column phone set default '';

create table public.ari_training_rate_limits (
  fingerprint text not null check (fingerprint ~ '^[a-f0-9]{64}$'),
  bucket bigint not null,
  attempts integer not null default 1,
  primary key(fingerprint,bucket)
);
alter table public.ari_training_rate_limits enable row level security;
revoke all on public.ari_training_rate_limits from anon, authenticated;
grant all on public.ari_training_rate_limits to service_role;

create function public.ari_training_rate_limit(p_fingerprint text)
returns boolean language plpgsql security invoker set search_path = ''
as $$
declare v_bucket bigint := floor(extract(epoch from now())/600); v_hits integer;
begin
  if p_fingerprint !~ '^[a-f0-9]{64}$' then return false; end if;
  delete from public.ari_training_rate_limits where bucket < v_bucket-6;
  insert into public.ari_training_rate_limits(fingerprint,bucket,attempts)
    values(p_fingerprint,v_bucket,1)
    on conflict(fingerprint,bucket) do update set attempts=ari_training_rate_limits.attempts+1
    returning attempts into v_hits;
  return v_hits <= 120;
end $$;
revoke all on function public.ari_training_rate_limit(text) from public, anon, authenticated;
grant execute on function public.ari_training_rate_limit(text) to service_role;

create or replace function public.ari_training_search(p_query text default '', p_status text default '', p_offset integer default 0)
returns setof public.ari_training_registrations
language sql stable security invoker set search_path = ''
as $$
  select r.* from public.ari_training_registrations r
  where r.event_id = 1
    and (p_status = '' or r.status = p_status)
    and (p_query = '' or position(lower(p_query) in lower(
      r.full_name || ' ' || r.email || ' ' || r.city || ' ' || r.residence_country || ' ' || r.education_domain
    )) > 0)
  order by r.created_at, r.id limit 500 offset greatest(p_offset,0)
$$;
revoke all on function public.ari_training_search(text,text,integer) from public, anon, authenticated;
grant execute on function public.ari_training_search(text,text,integer) to service_role;

alter table public.ari_training_registrations alter column full_name type varchar(161);
