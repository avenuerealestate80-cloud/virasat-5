/*
# Create property-images storage bucket

## Summary
Creates a public storage bucket for property/rental/testimonial/blog images.
Admins can upload, update, delete. Anyone (anon) can read — images are public.

## Storage Bucket
- `property-images` — public bucket for all admin-uploaded images

## Policies
- SELECT (read): public (anon, authenticated) — images need to be visible to site visitors
- INSERT (upload): admin only via is_admin()
- UPDATE: admin only via is_admin()
- DELETE: admin only via is_admin()
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "admin_upload_property_images" ON storage.objects;
CREATE POLICY "admin_upload_property_images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images' AND is_admin());

DROP POLICY IF EXISTS "admin_update_property_images" ON storage.objects;
CREATE POLICY "admin_update_property_images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'property-images' AND is_admin()) WITH CHECK (bucket_id = 'property-images' AND is_admin());

DROP POLICY IF EXISTS "admin_delete_property_images" ON storage.objects;
CREATE POLICY "admin_delete_property_images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'property-images' AND is_admin());

DROP POLICY IF EXISTS "public_read_property_images" ON storage.objects;
CREATE POLICY "public_read_property_images" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'property-images');