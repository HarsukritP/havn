-- Enable PostGIS extension for geospatial queries
-- This must run before creating tables with geography columns

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verify PostGIS is installed
DO $$
DECLARE
    postgis_version TEXT;
BEGIN
    SELECT PostGIS_Version() INTO postgis_version;
    RAISE NOTICE 'PostGIS version: %', postgis_version;
END $$;

