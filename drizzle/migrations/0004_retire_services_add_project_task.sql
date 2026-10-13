update public.services set active = false where name in ('Tutoring Session', 'Formatting & Referencing', 'Presentation Support');

insert into public.services (name, description, base_price, currency, unit, active, sort)
values ('Project Task', 'Help planning and completing a project or group task — proposal, structure, sources, write-up and final polish.', 0, 'KES', 'price on request', true, 9);