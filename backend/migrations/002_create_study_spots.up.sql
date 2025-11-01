-- Create study_spots table with PostGIS geography support
-- Geography type uses SRID 4326 (WGS84) for lat/lng coordinates

CREATE TABLE IF NOT EXISTS study_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    
    -- PostGIS geography column (Point with SRID 4326 = WGS84)
    -- This enables efficient distance queries and spatial operations
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    
    -- Keep traditional lat/lng for convenience and backwards compatibility
    latitude DECIMAL(10, 8) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude DECIMAL(11, 8) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    
    -- Capacity
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    current_available INTEGER CHECK (current_available IS NULL OR (current_available >= 0 AND current_available <= total_capacity)),
    
    -- Availability status (calculated from current_available/total_capacity)
    availability_status VARCHAR(20) DEFAULT 'unknown' CHECK (availability_status IN ('available', 'low', 'full', 'unknown')),
    
    -- Confidence score for current availability (0.00 to 1.00)
    confidence_score DECIMAL(3, 2) DEFAULT 0.00 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    -- Amenities (stored as JSONB for flexibility)
    amenities JSONB DEFAULT '{"wifi": true, "outlets": true, "printer": false, "quiet_zone": false, "outdoor": false}'::jsonb,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_update_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create spatial index for fast geospatial queries (CRITICAL for performance)
-- This index uses GIST (Generalized Search Tree) optimized for geography
CREATE INDEX idx_study_spots_location_gist ON study_spots USING GIST(location);

-- Create regular indexes
CREATE INDEX idx_study_spots_active ON study_spots(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_study_spots_availability ON study_spots(availability_status) WHERE is_active = TRUE;
CREATE INDEX idx_study_spots_updated ON study_spots(last_update_at DESC NULLS LAST);
CREATE INDEX idx_study_spots_name ON study_spots(name) WHERE is_active = TRUE;

-- Create function to automatically set location from lat/lng on INSERT
CREATE OR REPLACE FUNCTION set_location_from_coords()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically create PostGIS point from lat/lng
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run before INSERT
CREATE TRIGGER trigger_set_location
    BEFORE INSERT ON study_spots
    FOR EACH ROW
    EXECUTE FUNCTION set_location_from_coords();

-- Create function to sync location and lat/lng on UPDATE
CREATE OR REPLACE FUNCTION sync_location_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- If lat/lng changed, update location
    IF NEW.latitude IS DISTINCT FROM OLD.latitude OR NEW.longitude IS DISTINCT FROM OLD.longitude THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    
    -- If location changed, update lat/lng (for manual updates via PostGIS functions)
    IF NEW.location IS DISTINCT FROM OLD.location THEN
        NEW.latitude = ST_Y(NEW.location::geometry);
        NEW.longitude = ST_X(NEW.location::geometry);
    END IF;
    
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run before UPDATE
CREATE TRIGGER trigger_sync_location
    BEFORE UPDATE ON study_spots
    FOR EACH ROW
    EXECUTE FUNCTION sync_location_fields();

-- Create function to calculate availability status
CREATE OR REPLACE FUNCTION calculate_availability_status(available INTEGER, capacity INTEGER)
RETURNS VARCHAR(20) AS $$
BEGIN
    IF available IS NULL THEN
        RETURN 'unknown';
    END IF;
    
    IF available::DECIMAL / capacity >= 0.5 THEN
        RETURN 'available';
    ELSIF available::DECIMAL / capacity >= 0.2 THEN
        RETURN 'low';
    ELSE
        RETURN 'full';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add helpful comments to table and columns
COMMENT ON TABLE study_spots IS 'Study spots on campus with real-time availability';
COMMENT ON COLUMN study_spots.location IS 'PostGIS geography point (SRID 4326) for efficient spatial queries';
COMMENT ON COLUMN study_spots.confidence_score IS 'Confidence in current availability (0-1), based on recency and user reputation';
COMMENT ON COLUMN study_spots.amenities IS 'JSONB object with amenities: {"wifi": bool, "outlets": bool, "printer": bool, "quiet_zone": bool, "outdoor": bool}';
