-- Postanos Database Schema for Cloudflare D1 (SQLite)

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    clerk_user_id TEXT UNIQUE,
    email TEXT NOT NULL UNIQUE,
    phone_opt_in BOOLEAN DEFAULT FALSE,
    stripe_customer_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    address_json TEXT NOT NULL, -- JSON field for address data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Occasions table
CREATE TABLE IF NOT EXISTS occasions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    contact_id TEXT NOT NULL,
    label TEXT NOT NULL, -- e.g., "Birthday", "Anniversary"
    date TEXT NOT NULL, -- ISO 8601 date format (YYYY-MM-DD)
    lead_days INTEGER DEFAULT 7, -- Days before date to send card
    auto_send BOOLEAN DEFAULT FALSE,
    recurring BOOLEAN DEFAULT TRUE, -- Annual recurrence
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    occasion_label TEXT, -- Optional label to match with occasions
    front_image_url TEXT NOT NULL, -- URL to R2/CDN
    back_image_url TEXT, -- Optional custom back design
    message_text TEXT NOT NULL,
    ai_style_json TEXT, -- JSON field for AI generation parameters
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Jobs table (scheduled postcard sends)
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    occasion_id TEXT NOT NULL,
    template_id TEXT, -- NULL means use default template
    send_date TEXT NOT NULL, -- ISO 8601 date when card should be sent
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'delivered', 'failed', 'cancelled')),
    lob_id TEXT, -- Lob API postcard ID
    lob_tracking_url TEXT,
    notification_sent BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    delivered_at DATETIME,
    FOREIGN KEY (occasion_id) REFERENCES occasions(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_occasions_contact_id ON occasions(contact_id);
CREATE INDEX IF NOT EXISTS idx_occasions_date ON occasions(date);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_occasion_label ON templates(occasion_label);
CREATE INDEX IF NOT EXISTS idx_jobs_occasion_id ON jobs(occasion_id);
CREATE INDEX IF NOT EXISTS idx_jobs_send_date ON jobs(send_date);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- Triggers to update the updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_contacts_timestamp 
AFTER UPDATE ON contacts
BEGIN
    UPDATE contacts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_occasions_timestamp 
AFTER UPDATE ON occasions
BEGIN
    UPDATE occasions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_templates_timestamp 
AFTER UPDATE ON templates
BEGIN
    UPDATE templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;