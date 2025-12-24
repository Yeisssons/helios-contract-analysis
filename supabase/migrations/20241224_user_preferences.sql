-- User AI Preferences Migration
-- Allows Enterprise users to select their preferred AI model

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_ai_provider TEXT DEFAULT NULL CHECK (preferred_ai_provider IN ('gemini', 'openai', 'claude', NULL)),
    preferred_ai_model TEXT DEFAULT NULL,
    theme TEXT DEFAULT 'dark',
    language TEXT DEFAULT 'es',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own preferences
CREATE POLICY "Users can view own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Function to auto-create preferences on user signup
CREATE OR REPLACE FUNCTION handle_new_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON auth.users;
CREATE TRIGGER on_auth_user_created_preferences
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user_preferences();

-- Add user_plan column to profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'plan'
    ) THEN
        ALTER TABLE profiles ADD COLUMN plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise'));
    END IF;
END $$;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

COMMENT ON TABLE user_preferences IS 'User preferences including AI model selection for Enterprise users';
COMMENT ON COLUMN user_preferences.preferred_ai_provider IS 'Preferred AI provider: gemini, openai, or claude (Enterprise only)';
COMMENT ON COLUMN user_preferences.preferred_ai_model IS 'Specific model name like gemini-3-pro, gpt-5, claude-sonnet-4';
