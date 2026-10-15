/*
# Create inquiries table for contact form submissions

1. New Tables
- `inquiries`
- `id` (uuid, primary key)
- `full_name` (text, not null) — name of the person submitting the inquiry
- `organization` (text, nullable) — organization name if applicable
- `email` (text, not null) — contact email
- `phone` (text, not null) — contact phone number
- `service_required` (text, not null) — which service the inquiry relates to
- `project_location` (text, nullable) — location of the proposed project
- `estimated_budget` (text, nullable) — optional budget range
- `project_description` (text, not null) — details about the project
- `consent` (boolean, not null) — consent to privacy notice
- `status` (text, default 'new') — tracking status for the inquiry
- `created_at` (timestamptz, default now()) — when the inquiry was submitted

2. Security
- Enable RLS on `inquiries`.
- Allow anon + authenticated to INSERT (public contact form, no sign-in required).
- No SELECT/UPDATE/DELETE for anon or authenticated — inquiries are managed server-side only.

3. Important Notes
- This is a public contact form with no authentication, so INSERT is allowed for anon.
- Inquiry data is private to company operators and must not be readable via the anon key.
- Status defaults to 'new' for tracking purposes.
*/

CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  organization text,
  email text NOT NULL,
  phone text NOT NULL,
  service_required text NOT NULL,
  project_location text,
  estimated_budget text,
  project_description text NOT NULL,
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_inquiries" ON inquiries;
CREATE POLICY "anon_insert_inquiries"
ON inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);
