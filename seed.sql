-- Seed data for feedback_db
-- Run this to populate your D1 database with demo data

-- Create table (if not exists)
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    summary TEXT,
    sentiment TEXT,
    category TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Insert mock feedback data
INSERT INTO feedback (text, summary, sentiment, category, created_at) VALUES
(
    'The dashboard takes over 10 seconds to load on my connection. This is really frustrating when I need to check analytics quickly.',
    'Dashboard performance issue causing user frustration',
    'negative',
    'Bug',
    '2026-01-18 14:23:00'
),
(
    'Love the new dark mode feature! Makes working at night so much easier on the eyes. Great job team!',
    'Positive feedback on new dark mode feature improving user experience',
    'positive',
    'Praise',
    '2026-01-18 16:45:00'
),
(
    'Would be great to have email notifications when someone comments on or resolves our submitted feedback.',
    'Feature request for email notifications on feedback updates',
    'neutral',
    'Feature Request',
    '2026-01-19 09:12:00'
),
(
    'The search function doesn''t work well with special characters. Tried searching for "C++" and got no results.',
    'Search functionality fails with special characters',
    'negative',
    'Bug',
    '2026-01-19 11:30:00'
),
(
    'Really appreciate the mobile app improvements! The UI is much cleaner now.',
    'Appreciation for mobile app UI improvements',
    'positive',
    'Praise',
    '2026-01-19 15:22:00'
),
(
    'Can we get a bulk export feature for feedback data? Need this for quarterly reports.',
    'Request for bulk data export functionality',
    'neutral',
    'Feature Request',
    '2026-01-20 08:45:00'
),
(
    'The API documentation is outdated. The authentication examples don''t match the current implementation.',
    'API documentation accuracy issues with authentication examples',
    'negative',
    'Other',
    '2026-01-20 10:15:00'
);