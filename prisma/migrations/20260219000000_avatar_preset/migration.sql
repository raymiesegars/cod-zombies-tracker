-- Add avatarPreset so users can pick a themed preset avatar instead of their OAuth photo.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarPreset" TEXT;
