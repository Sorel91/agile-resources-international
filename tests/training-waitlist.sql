\set ON_ERROR_STOP on
create table public.ari_training_events(id integer primary key);
insert into public.ari_training_events values(1);
create table public.ari_training_registrations(id serial primary key,event_id integer not null,email text unique,status text default 'pending',
constraint ari_training_registrations_status_check check(status in ('pending','confirmed','cancelled')));
create role anon;
create role authenticated;
create role service_role;
\ir ../supabase/waitlist.sql
do $$
declare i integer; current_status text; before_count bigint;
begin
 for i in 1..36 loop
   insert into public.ari_training_registrations(event_id,email) values(1,'test-'||i||'@example.invalid') returning status into current_status;
   if current_status <> case when i<=35 then 'pending' else 'waitlist' end then raise exception 'Incorrect threshold at %',i; end if;
 end loop;
 select registration_count into before_count from public.ari_training_events where id=1;
 begin
  insert into public.ari_training_registrations(event_id,email) values(1,'test-1@example.invalid');
 exception when unique_violation then null;
 end;
 if (select registration_count from public.ari_training_events where id=1)<>before_count then raise exception 'Duplicate consumed a place'; end if;
 update public.ari_training_registrations set status='cancelled' where email='test-1@example.invalid';
 insert into public.ari_training_registrations(event_id,email) values(1,'next@example.invalid') returning status into current_status;
 if current_status<>'waitlist' then raise exception 'Manual promotion should remain necessary after cancellation'; end if;
end $$;
