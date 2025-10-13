-- Create spot_updates table
CREATE TABLE IF NOT EXISTS spot_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_id UUID NOT NULL REFERENCES study_spots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Update data
    seats_available INTEGER NOT NULL CHECK (seats_available >= 0),
    noise_level VARCHAR(20) CHECK (noise_level IN ('quiet', 'moderate', 'loud') OR noise_level IS NULL),
    photo_url VARCHAR(500),
    
    -- Location verification
    user_latitude DECIMAL(10, 7) NOT NULL,
    user_longitude DECIMAL(10, 7) NOT NULL,
    distance_from_spot DECIMAL(10, 2),
    
    -- Quality metrics
    confidence_score DECIMAL(5, 2),
    is_accurate BOOLEAN,
    accuracy_verified_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_updates_spot_id ON spot_updates(spot_id, created_at DESC);
CREATE INDEX idx_updates_user_id ON spot_updates(user_id, created_at DESC);
CREATE INDEX idx_updates_created_at ON spot_updates(created_at DESC);

