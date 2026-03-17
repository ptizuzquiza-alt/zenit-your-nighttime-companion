
-- Table for Barcelona street light points
CREATE TABLE public.light_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  street_name TEXT,
  light_type TEXT DEFAULT 'LED',
  power_watts INTEGER DEFAULT 150,
  district TEXT,
  neighborhood TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Spatial index for fast proximity queries
CREATE INDEX idx_light_points_coords ON public.light_points (latitude, longitude);

-- Index by district
CREATE INDEX idx_light_points_district ON public.light_points (district);

-- Enable RLS (public read, no write from client)
ALTER TABLE public.light_points ENABLE ROW LEVEL SECURITY;

-- Anyone can read light points (public infrastructure data)
CREATE POLICY "Light points are publicly readable"
ON public.light_points
FOR SELECT
USING (true);
