-- Add venue details columns to weddings table
ALTER TABLE weddings
  ADD COLUMN IF NOT EXISTS venue text,
  ADD COLUMN IF NOT EXISTS venue_address text,
  ADD COLUMN IF NOT EXISTS venue_lat double precision,
  ADD COLUMN IF NOT EXISTS venue_lng double precision,
  ADD COLUMN IF NOT EXISTS welcome_message text;

-- Coordinate pair integrity: both lat and lng must be present or both null
ALTER TABLE weddings
  ADD CONSTRAINT weddings_coordinate_pair_check
  CHECK (venue_lat IS NULL AND venue_lng IS NULL OR venue_lat IS NOT NULL AND venue_lng IS NOT NULL);

-- Coordinate range validation
ALTER TABLE weddings
  ADD CONSTRAINT weddings_venue_lat_range_check
  CHECK (venue_lat IS NULL OR venue_lat >= -90 AND venue_lat <= 90);

ALTER TABLE weddings
  ADD CONSTRAINT weddings_venue_lng_range_check
  CHECK (venue_lng IS NULL OR venue_lng >= -180 AND venue_lng <= 180);

-- Welcome message length limit
ALTER TABLE weddings
  ADD CONSTRAINT weddings_welcome_message_length_check
  CHECK (welcome_message IS NULL OR length(welcome_message) <= 500);
