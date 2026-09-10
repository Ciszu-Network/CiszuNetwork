-- Add actions column to global_disclaimers for button support

ALTER TABLE ciszunetwork.global_disclaimers
  ADD COLUMN IF NOT EXISTS actions JSONB;
