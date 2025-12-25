-- Activity Logs Table for Admin Monitoring
-- Tracks user actions without storing sensitive data
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    agent_used TEXT,
    user_plan TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_agent ON activity_logs(agent_used);
-- Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
-- Admins can see all logs
CREATE POLICY admin_read_all_logs ON activity_logs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = true
        )
    );
-- Only system can insert logs (via service role)
CREATE POLICY system_insert_logs ON activity_logs FOR
INSERT WITH CHECK (true);
-- Auto-cleanup old logs (90 days retention)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs() RETURNS void AS $$ BEGIN
DELETE FROM activity_logs
WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Optional: Create a cron job to run cleanup daily (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-logs', '0 2 * * *', 'SELECT cleanup_old_activity_logs()');