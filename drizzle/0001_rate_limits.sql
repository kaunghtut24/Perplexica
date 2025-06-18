CREATE TABLE IF NOT EXISTS rate_limits (
  identifier VARCHAR(255) PRIMARY KEY,
  tokens INTEGER NOT NULL,
  last_updated INTEGER NOT NULL
); 