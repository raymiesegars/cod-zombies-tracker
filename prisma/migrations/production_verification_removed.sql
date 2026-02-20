-- =============================================================================
-- PRODUCTION: Add VERIFICATION_REMOVED to NotificationType enum
-- =============================================================================
-- Safe to run: Only adds one new enum value. No tables created/dropped,
-- no data deleted or modified. Required for "Remove verification" notifications.
-- Idempotent: Safe to run multiple times (IF NOT EXISTS).
-- =============================================================================

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'VERIFICATION_REMOVED';
