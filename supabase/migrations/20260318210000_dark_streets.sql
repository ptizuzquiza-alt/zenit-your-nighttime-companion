-- Dark streets table: user-reported poorly lit or dangerous streets
-- Real crowdsourced safety data for Barcelona

CREATE TABLE IF NOT EXISTS dark_streets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  street_name TEXT,
  description TEXT,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  upvotes INTEGER DEFAULT 1
);

-- Enable RLS
ALTER TABLE dark_streets ENABLE ROW LEVEL SECURITY;

-- Anyone can read dark streets (for routing + map display)
CREATE POLICY "Public read dark_streets"
  ON dark_streets FOR SELECT
  USING (true);

-- Anyone can report a dark street (anonymous reporting)
CREATE POLICY "Public insert dark_streets"
  ON dark_streets FOR INSERT
  WITH CHECK (true);

-- Anyone can upvote (increment upvotes)
CREATE POLICY "Public update upvotes"
  ON dark_streets FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Index for spatial queries
CREATE INDEX IF NOT EXISTS dark_streets_lat_lon ON dark_streets (latitude, longitude);
CREATE INDEX IF NOT EXISTS dark_streets_reported_at ON dark_streets (reported_at DESC);
