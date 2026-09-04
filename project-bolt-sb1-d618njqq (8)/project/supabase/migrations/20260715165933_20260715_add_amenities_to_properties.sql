/*
# Add amenities column to properties table

## Summary
Adds an `amenities` text array column to the `properties` table so individual projects
can tag their amenities (e.g. Swimming Pool, Gym, Clubhouse, Power Backup). This is
separate from the existing `features` column — `features` describes unit-level features
while `amenities` describes project-level/common amenities, matching the pattern used
by sites like SquareYards.

## Changes
- `properties.amenities` text[] — nullable, defaults to null
- No data loss — existing rows get null (no amenities)

## Security
- No policy changes needed — existing RLS policies cover the new column automatically
*/

ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities text[];