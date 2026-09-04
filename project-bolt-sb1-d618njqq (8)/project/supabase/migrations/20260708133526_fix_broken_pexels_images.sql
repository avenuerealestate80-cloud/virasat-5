-- Fix broken Pexels image URLs (404s) across properties, localities, and blog posts

-- Properties: replace broken image_url
UPDATE properties SET image_url = 'https://images.pexels.com/photos/1396133/pexels-photo-1396133.jpeg?auto=compress&cs=tinysrgb&w=1200'
WHERE image_url LIKE '%/photos/53610/%';

UPDATE properties SET image_url = 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=1200'
WHERE image_url LIKE '%/photos/1029542/%';

UPDATE properties SET image_url = 'https://images.pexels.com/photos/803975/pexels-photo-803975.jpeg?auto=compress&cs=tinysrgb&w=1200'
WHERE image_url LIKE '%/photos/1520259/%';

UPDATE properties SET image_url = 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1200'
WHERE image_url LIKE '%/photos/1115803/%';

UPDATE properties SET image_url = 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=1200'
WHERE image_url LIKE '%/photos/1486322/%';

UPDATE properties SET image_url = 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200'
WHERE image_url LIKE '%/photos/3945545/%';

-- Gallery arrays (text[]): replace broken URLs using array_replace
UPDATE properties SET gallery = array_replace(gallery,
  'https://images.pexels.com/photos/1520259/pexels-photo-1520259.jpeg',
  'https://images.pexels.com/photos/803975/pexels-photo-803975.jpeg')
WHERE gallery IS NOT NULL AND 'https://images.pexels.com/photos/1520259/pexels-photo-1520259.jpeg' = ANY(gallery);

UPDATE properties SET gallery = array_replace(gallery,
  'https://images.pexels.com/photos/1115803/pexels-photo-1115803.jpeg',
  'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg')
WHERE gallery IS NOT NULL AND 'https://images.pexels.com/photos/1115803/pexels-photo-1115803.jpeg' = ANY(gallery);

UPDATE properties SET gallery = array_replace(gallery,
  'https://images.pexels.com/photos/1486322/pexels-photo-1486322.jpeg',
  'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg')
WHERE gallery IS NOT NULL AND 'https://images.pexels.com/photos/1486322/pexels-photo-1486322.jpeg' = ANY(gallery);

UPDATE properties SET gallery = array_replace(gallery,
  'https://images.pexels.com/photos/3945545/pexels-photo-3945545.jpeg',
  'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg')
WHERE gallery IS NOT NULL AND 'https://images.pexels.com/photos/3945545/pexels-photo-3945545.jpeg' = ANY(gallery);

UPDATE properties SET gallery = array_replace(gallery,
  'https://images.pexels.com/photos/53610/large-home-preview-ca.jpeg',
  'https://images.pexels.com/photos/1396133/pexels-photo-1396133.jpeg')
WHERE gallery IS NOT NULL AND 'https://images.pexels.com/photos/53610/large-home-preview-ca.jpeg' = ANY(gallery);

UPDATE properties SET gallery = array_replace(gallery,
  'https://images.pexels.com/photos/1029542/pexels-photo-1029542.jpeg',
  'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg')
WHERE gallery IS NOT NULL AND 'https://images.pexels.com/photos/1029542/pexels-photo-1029542.jpeg' = ANY(gallery);

-- Localities: set images for null ones
UPDATE localities SET image_url = 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE slug = 'sector-33-sohna' AND image_url IS NULL;

UPDATE localities SET image_url = 'https://images.pexels.com/photos/803975/pexels-photo-803975.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE slug = 'sector-35-sohna' AND image_url IS NULL;

UPDATE localities SET image_url = 'https://images.pexels.com/photos/1396133/pexels-photo-1396133.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE slug = 'sector-36-sohna' AND image_url IS NULL;

UPDATE localities SET image_url = 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE slug = 'sector-63a-gurgaon' AND image_url IS NULL;

UPDATE localities SET image_url = 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE slug = 'sector-67-gurgaon' AND image_url IS NULL;

UPDATE localities SET image_url = 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE slug = 'sector-70-gurgaon' AND image_url IS NULL;

UPDATE localities SET image_url = 'https://images.pexels.com/photos/260689/pexels-photo-260689.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE slug = 'sohna-road' AND image_url IS NULL;

-- Fix locality with broken image (Gwal Pahari uses 1520259 which is 404)
UPDATE localities SET image_url = 'https://images.pexels.com/photos/803975/pexels-photo-803975.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE slug = 'gwal-pahari' AND image_url LIKE '%/photos/1520259/%';

-- Fix locality with broken image (Sector 67 uses 1115803 which is 404)
UPDATE localities SET image_url = 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE slug = 'sector-67-gurugram' AND image_url LIKE '%/photos/1115803/%';
