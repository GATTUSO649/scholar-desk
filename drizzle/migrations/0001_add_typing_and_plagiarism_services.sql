insert into public.services (name, description, base_price, unit, sort)
select * from (values
  ('Assignment Typing','Clean, correctly formatted typing of your handwritten notes, PDFs or scans — with tables, equations and figures laid out properly.',2,'per page',7),
  ('Plagiarism Check & Removal','A similarity scan of your draft, then rewriting of the flagged passages so the document you submit reads as your own work.',3,'per page',8)
) as v(name, description, base_price, unit, sort)
where not exists (select 1 from public.services s where s.name = v.name);