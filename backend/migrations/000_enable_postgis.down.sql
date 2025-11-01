-- Drop PostGIS extensions
-- WARNING: This will remove all PostGIS functionality and data types

DROP EXTENSION IF EXISTS postgis_topology CASCADE;
DROP EXTENSION IF EXISTS postgis CASCADE;

