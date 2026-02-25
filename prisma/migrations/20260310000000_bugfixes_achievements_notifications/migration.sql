-- Bug fixes: remove (Cap) from achievement names, safe for production
UPDATE "Achievement"
SET "name" = REPLACE("name", ' (Cap)', '')
WHERE "name" LIKE '% (Cap)';
