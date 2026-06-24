-- Cleanup: Remove test products and store listings from production database.
-- Run this script once via Supabase SQL Editor or psql.
-- It is safe to re-run (deletes 0 rows if already clean).
--
-- To VERIFY before running, execute the SELECT statements below first.
-- To ROLLBACK, wrap the DELETEs in BEGIN/ROLLBACK during review.

-- Preview what will be deleted:
-- SELECT id, title, brand FROM public.products WHERE title ILIKE '%test%' OR brand ILIKE '%test%';
-- SELECT id, store_name, raw_title FROM public.store_listings WHERE store_name ILIKE '%test%' OR raw_title ILIKE '%test%';

BEGIN;

-- Remove store_listings that reference test products (cascade would handle it,
-- but being explicit keeps the audit trail clear).
DELETE FROM public.store_listings
WHERE
  store_name ILIKE '%test%'
  OR raw_title  ILIKE '%test%';

-- Remove the master product records themselves.
DELETE FROM public.products
WHERE
  title ILIKE '%test%'
  OR brand ILIKE '%test%';

COMMIT;
