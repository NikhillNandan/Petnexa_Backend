-- =====================================================
-- Update Pet Availability Status Migration
-- Sets all NULL/empty availability_status to 'AVAILABLE'
-- and adds NOT NULL DEFAULT constraint
-- =====================================================

-- Step 1: Update all NULL or empty values to AVAILABLE
UPDATE pets SET availability_status = 'AVAILABLE' WHERE availability_status IS NULL OR availability_status = '';

-- Step 2: Alter column to enforce NOT NULL with DEFAULT
ALTER TABLE pets MODIFY COLUMN availability_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE';

-- Step 3: Verify the update
SELECT pet_id, pet_name, availability_status FROM pets;
