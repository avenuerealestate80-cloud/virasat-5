-- Populate price_trend and future_projects for all localities

UPDATE localities SET price_trend = '{"2020": 4200, "2021": 4500, "2022": 5100, "2023": 5800, "2024": 6500, "2025": 7200}'::jsonb,
  future_projects = '[{"name": "Sohna Elevated Road", "type": "Infrastructure", "eta": "2026", "description": "6-lane elevated corridor connecting Rajiv Chowk to Sohna"}, {"name": "DMRC Metro Extension", "type": "Transit", "eta": "2027", "description": "Yellow line extension to Sohna with 3 stations"}]'::jsonb
WHERE slug = 'sohna-road';

UPDATE localities SET price_trend = '{"2020": 3800, "2021": 4100, "2022": 4600, "2023": 5200, "2024": 5900, "2025": 6600}'::jsonb,
  future_projects = '[{"name": "Sohna Elevated Road", "type": "Infrastructure", "eta": "2026", "description": "Direct connectivity to NH-48"}, {"name": "Global City", "type": "Mixed-use", "eta": "2028", "description": "750-acre integrated township by HSIIDC"}]'::jsonb
WHERE slug = 'sector-33-sohna';

UPDATE localities SET price_trend = '{"2020": 3500, "2021": 3800, "2022": 4300, "2023": 4900, "2024": 5500, "2025": 6200}'::jsonb,
  future_projects = '[{"name": "Sohna Elevated Road", "type": "Infrastructure", "eta": "2026", "description": "Reduced commute time to Gurugram"}, {"name": "AIIMS Phase 2", "type": "Healthcare", "eta": "2027", "description": "Expansion of AIIMS Badsa campus"}]'::jsonb
WHERE slug = 'sector-35-sohna';

UPDATE localities SET price_trend = '{"2020": 3600, "2021": 3900, "2022": 4400, "2023": 5000, "2024": 5700, "2025": 6400}'::jsonb,
  future_projects = '[{"name": "Sohna Elevated Road", "type": "Infrastructure", "eta": "2026", "description": "Seamless connectivity to major hubs"}, {"name": "KMP Expressway", "type": "Infrastructure", "eta": "Completed", "description": "Western peripheral expressway access"}]'::jsonb
WHERE slug = 'sector-36-sohna';

UPDATE localities SET price_trend = '{"2020": 8500, "2021": 9200, "2022": 10500, "2023": 12000, "2024": 13500, "2025": 15000}'::jsonb,
  future_projects = '[{"name": "Golf Course Extension Road", "type": "Infrastructure", "eta": "2026", "description": "Widening to 6 lanes"}, {"name": "Metro Phase 4", "type": "Transit", "eta": "2027", "description": "Rapid metro extension along Golf Course Road"}]'::jsonb
WHERE slug = 'sector-63a-gurugram';

UPDATE localities SET price_trend = '{"2020": 8500, "2021": 9200, "2022": 10500, "2023": 12000, "2024": 13500, "2025": 15000}'::jsonb,
  future_projects = '[{"name": "Golf Course Extension Road", "type": "Infrastructure", "eta": "2026", "description": "Widening to 6 lanes"}, {"name": "Metro Phase 4", "type": "Transit", "eta": "2027", "description": "Rapid metro extension along Golf Course Road"}]'::jsonb
WHERE slug = 'sector-63a-gurgaon';

UPDATE localities SET price_trend = '{"2020": 6500, "2021": 7000, "2022": 7800, "2023": 8800, "2024": 9800, "2025": 10800}'::jsonb,
  future_projects = '[{"name": "Sohna Road Widening", "type": "Infrastructure", "eta": "2025", "description": "Additional service lanes"}, {"name": "Southern Peripheral Road", "type": "Infrastructure", "eta": "2026", "description": "New connectivity to NH-48"}]'::jsonb
WHERE slug = 'sector-67-gurugram';

UPDATE localities SET price_trend = '{"2020": 6500, "2021": 7000, "2022": 7800, "2023": 8800, "2024": 9800, "2025": 10800}'::jsonb,
  future_projects = '[{"name": "Sohna Road Widening", "type": "Infrastructure", "eta": "2025", "description": "Additional service lanes"}, {"name": "Southern Peripheral Road", "type": "Infrastructure", "eta": "2026", "description": "New connectivity to NH-48"}]'::jsonb
WHERE slug = 'sector-67-gurgaon';

UPDATE localities SET price_trend = '{"2020": 7200, "2021": 7800, "2022": 8600, "2023": 9600, "2024": 10600, "2025": 11600}'::jsonb,
  future_projects = '[{"name": "Southern Peripheral Road", "type": "Infrastructure", "eta": "2026", "description": "Direct access to NH-48"}, {"name": "Metro Phase 4", "type": "Transit", "eta": "2027", "description": "New metro station planned"}]'::jsonb
WHERE slug = 'sector-70-gurugram';

UPDATE localities SET price_trend = '{"2020": 7200, "2021": 7800, "2022": 8600, "2023": 9600, "2024": 10600, "2025": 11600}'::jsonb,
  future_projects = '[{"name": "Southern Peripheral Road", "type": "Infrastructure", "eta": "2026", "description": "Direct access to NH-48"}, {"name": "Metro Phase 4", "type": "Transit", "eta": "2027", "description": "New metro station planned"}]'::jsonb
WHERE slug = 'sector-70-gurgaon';

UPDATE localities SET price_trend = '{"2020": 5500, "2021": 5900, "2022": 6500, "2023": 7300, "2024": 8100, "2025": 8900}'::jsonb,
  future_projects = '[{"name": "Gwal Pahari Bypass", "type": "Infrastructure", "eta": "2026", "description": "New bypass road reducing commute to Delhi"}, {"name": "Aravali Safari Park", "type": "Leisure", "eta": "2027", "description": "Planned eco-tourism project in Aravalli hills"}]'::jsonb
WHERE slug = 'gwal-pahari';
