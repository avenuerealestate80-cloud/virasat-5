
-- Merge duplicate Sector 63A localities (only localities table exists)
UPDATE localities
  SET name = 'Sector 63A Gurugram'
  WHERE id = '8b742676-425e-48f3-aaf9-66bad4223ac7';

DELETE FROM localities WHERE id = '4df05ac2-95c1-45f5-a0e6-19f461871e69';
