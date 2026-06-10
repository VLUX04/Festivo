-- Run this migration against your existing database to add missing features.

-- Saved events (bookmark)
CREATE TABLE IF NOT EXISTS saved_events (
    user_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, event_id)
);

-- Extend notification kinds
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'friend_request' AND enumtypid = 'notification_kind'::regtype) THEN
        ALTER TYPE notification_kind ADD VALUE 'friend_request';
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'friend_accept' AND enumtypid = 'notification_kind'::regtype) THEN
        ALTER TYPE notification_kind ADD VALUE 'friend_accept';
    END IF;
END $$;
