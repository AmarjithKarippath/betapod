-- Emits SQLite INSERT statements for D1 from the old Postgres database.
-- Usage: psql -q -At -f infra/pg-to-d1.sql > data.sql
-- Keeps original ids, converts timestamps to epoch ms and booleans to 0/1.
-- Strings are quoted SQLite-style (no Postgres E'' escapes).
CREATE OR REPLACE FUNCTION pg_temp.q(v text) RETURNS text LANGUAGE sql IMMUTABLE AS
  $$ SELECT coalesce('''' || replace(v, '''', '''''') || '''', 'NULL') $$;
CREATE OR REPLACE FUNCTION pg_temp.ms(v timestamptz) RETURNS text LANGUAGE sql IMMUTABLE AS
  $$ SELECT coalesce((extract(epoch FROM v) * 1000)::bigint::text, 'NULL') $$;

SELECT format('INSERT INTO users (id, email, name, password_hash, email_verified_at, created_at, is_admin) VALUES (%s, %s, %s, %s, %s, %s, %s);',
  id, pg_temp.q(email), pg_temp.q(name), pg_temp.q(password_hash), pg_temp.ms(email_verified_at),
  pg_temp.ms(created_at), CASE WHEN is_admin THEN 1 ELSE 0 END)
FROM users ORDER BY id;

SELECT format('INSERT INTO test_requests (id, owner_id, app_name, play_store_url, category, description, tester_count, duration_days, location, screenshot_path, status, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);',
  id, owner_id, pg_temp.q(app_name), pg_temp.q(play_store_url), pg_temp.q(category), pg_temp.q(description),
  tester_count, duration_days, pg_temp.q(location), pg_temp.q(screenshot_path), pg_temp.q(status), pg_temp.ms(created_at))
FROM test_requests ORDER BY id;

SELECT format('INSERT INTO enrollments (id, request_id, tester_id, created_at) VALUES (%s, %s, %s, %s);',
  id, request_id, tester_id, pg_temp.ms(created_at))
FROM enrollments ORDER BY id;

SELECT format('INSERT INTO feedback (id, user_id, kind, message, page_url, created_at) VALUES (%s, %s, %s, %s, %s, %s);',
  id, coalesce(user_id::text, 'NULL'), pg_temp.q(kind), pg_temp.q(message), pg_temp.q(page_url), pg_temp.ms(created_at))
FROM feedback ORDER BY id;
