-- Add BUILDABLE to EasterEggType enum (required for buildables category)
ALTER TYPE "EasterEggType" ADD VALUE IF NOT EXISTS 'BUILDABLE';
