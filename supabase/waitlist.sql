alter table public.ari_training_registrations drop constraint ari_training_registrations_status_check;
alter table public.ari_training_registrations add constraint ari_training_registrations_status_check check(status in ('pending','confirmed','cancelled','waitlist'));
alter table public.ari_training_events add column registration_count bigint not null default 0;
update public.ari_training_events set registration_count=(select count(*) from public.ari_training_registrations where event_id=1) where id=1;
create function public.ari_training_assign_queue() returns trigger
language plpgsql security invoker set search_path=''
as $$
declare position bigint;
begin
  update public.ari_training_events set registration_count=registration_count+1
    where id=new.event_id returning registration_count into position;
  if position is null then raise exception 'Unknown training event'; end if;
  new.status := case when position > 35 then 'waitlist' else 'pending' end;
  return new;
end $$;
revoke all on function public.ari_training_assign_queue() from public,anon,authenticated;
grant execute on function public.ari_training_assign_queue() to service_role;
create trigger ari_training_queue before insert on public.ari_training_registrations
for each row execute function public.ari_training_assign_queue();
