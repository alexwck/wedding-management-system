ALTER TABLE weddings
  ADD COLUMN is_locked BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN weddings.is_locked IS 'When true, all edits are frozen for all users including admin. Only the lock toggle itself may be changed.';
