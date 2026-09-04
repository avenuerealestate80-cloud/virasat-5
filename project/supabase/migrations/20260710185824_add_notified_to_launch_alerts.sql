ALTER TABLE launch_alerts ADD COLUMN IF NOT EXISTS notified boolean DEFAULT false;
ALTER TABLE launch_alerts ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES properties(id) ON DELETE SET NULL;
