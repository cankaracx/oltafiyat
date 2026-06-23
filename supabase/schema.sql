-- Ahşap Bisiklet Supabase kurulumu
-- RLS açık; public okuma, service role ile yazma.

create table if not exists public.site_data (
  id text primary key default 'main',
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_data enable row level security;

drop policy if exists "site_data public read" on public.site_data;
create policy "site_data public read"
on public.site_data for select
to anon, authenticated
using (true);

-- Yazma işlemleri Next.js API route üzerinden service role key ile yapılır.
-- Storage bucket: site-assets oluşturun ve public yapın.
insert into public.site_data (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;