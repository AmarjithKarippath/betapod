-- Baseline schema: SQLite/D1 port of api/alembic revisions 0001–0003.
-- Timestamps are epoch milliseconds (UTC).
CREATE TABLE users (
  id integer PRIMARY KEY AUTOINCREMENT,
  email text NOT NULL,
  name text NOT NULL,
  password_hash text NOT NULL,
  email_verified_at integer,
  created_at integer NOT NULL DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
  is_admin integer NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE TABLE test_requests (
  id integer PRIMARY KEY AUTOINCREMENT,
  owner_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  app_name text NOT NULL,
  play_store_url text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  tester_count integer NOT NULL,
  duration_days integer NOT NULL,
  location text NOT NULL,
  screenshot_path text,
  status text NOT NULL DEFAULT 'open',
  created_at integer NOT NULL DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
  CONSTRAINT ck_tester_count_positive CHECK (tester_count > 0),
  CONSTRAINT ck_duration_positive CHECK (duration_days > 0)
);
CREATE INDEX ix_test_requests_owner_id ON test_requests (owner_id);
CREATE INDEX ix_test_requests_category ON test_requests (category);
CREATE INDEX ix_test_requests_location ON test_requests (location);
CREATE INDEX ix_test_requests_status ON test_requests (status);

CREATE TABLE enrollments (
  id integer PRIMARY KEY AUTOINCREMENT,
  request_id integer NOT NULL REFERENCES test_requests (id) ON DELETE CASCADE,
  tester_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at integer NOT NULL DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
  CONSTRAINT uq_enrollment_request_tester UNIQUE (request_id, tester_id)
);
CREATE INDEX ix_enrollments_request_id ON enrollments (request_id);
CREATE INDEX ix_enrollments_tester_id ON enrollments (tester_id);

CREATE TABLE feedback (
  id integer PRIMARY KEY AUTOINCREMENT,
  user_id integer REFERENCES users (id) ON DELETE SET NULL,
  kind text NOT NULL,
  message text NOT NULL,
  page_url text,
  created_at integer NOT NULL DEFAULT (cast(unixepoch('subsec') * 1000 as integer))
);
CREATE INDEX ix_feedback_user_id ON feedback (user_id);
CREATE INDEX ix_feedback_kind ON feedback (kind);
