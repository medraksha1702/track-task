-- Add amc_id column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS amc_id UUID REFERENCES amcs(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_services_amc_id ON services(amc_id);

-- Add comment
COMMENT ON COLUMN services.amc_id IS 'Links service to AMC contract if service is covered under AMC';

