-- Lingora Database Setup for Supabase
-- Run this in your Supabase SQL editor: https://supabase.com/dashboard/project/wjrqsfvsnlmefmjwzltc/sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  nickname VARCHAR(100),
  profile_picture TEXT,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_study_date TIMESTAMP,
  hearts INTEGER DEFAULT 5 NOT NULL,
  subscription_type VARCHAR(20) DEFAULT 'free' NOT NULL,
  subscription_expires_at TIMESTAMP,
  streak_freeze_used BOOLEAN DEFAULT false NOT NULL,
  email_verified BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Languages table
CREATE TABLE IF NOT EXISTS languages (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100) NOT NULL,
  flag VARCHAR(10) NOT NULL,
  levels JSONB NOT NULL,
  writing_system TEXT,
  total_words INTEGER DEFAULT 20000 NOT NULL
);

-- User languages (learning progress per language)
CREATE TABLE IF NOT EXISTS user_languages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language_id INTEGER NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  current_level VARCHAR(50) DEFAULT 'beginner' NOT NULL,
  xp INTEGER DEFAULT 0 NOT NULL,
  words_learned INTEGER DEFAULT 0 NOT NULL,
  lessons_completed INTEGER DEFAULT 0 NOT NULL,
  last_studied TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, language_id)
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  language_id INTEGER NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  level VARCHAR(50) NOT NULL,
  order_index INTEGER NOT NULL,
  content JSONB NOT NULL,
  xp_reward INTEGER DEFAULT 10 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User lesson progress
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false NOT NULL,
  score INTEGER,
  completed_at TIMESTAMP,
  attempts INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, lesson_id)
);

-- Shop items table
CREATE TABLE IF NOT EXISTS shop_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  rarity VARCHAR(20) DEFAULT 'common' NOT NULL
);

-- User items (inventory)
CREATE TABLE IF NOT EXISTS user_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 NOT NULL,
  acquired_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, item_id)
);

-- Friends table
CREATE TABLE IF NOT EXISTS friends (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMP,
  UNIQUE(user_id, friend_id),
  CHECK(user_id != friend_id)
);

-- Trade offers table
CREATE TABLE IF NOT EXISTS trade_offers (
  id SERIAL PRIMARY KEY,
  from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offered_item_id INTEGER NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  requested_item_id INTEGER NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMP
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 50 NOT NULL
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Daily stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  xp_earned INTEGER DEFAULT 0 NOT NULL,
  lessons_completed INTEGER DEFAULT 0 NOT NULL,
  time_studied INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

-- Insert languages data
INSERT INTO languages (code, name, native_name, flag, levels, writing_system, total_words) VALUES
('ja', 'Japanese', '日本語', '🇯🇵', '["kana", "jlpt-n5", "jlpt-n4", "jlpt-n3", "jlpt-n2", "jlpt-n1"]'::jsonb, 'Hiragana, Katakana, Kanji', 20000),
('zh', 'Chinese', '中文', '🇨🇳', '["beginner", "elementary", "intermediate", "advanced", "expert"]'::jsonb, 'Hanzi (Simplified/Traditional)', 20000),
('hr', 'Serbo-Croatian', 'Српскохрватски', '🇭🇷', '["beginner", "intermediate", "advanced", "expert"]'::jsonb, 'Latin and Cyrillic', 20000),
('es', 'Spanish', 'Español', '🇪🇸', '["beginner", "intermediate", "advanced", "expert"]'::jsonb, 'Latin', 20000),
('ko', 'Korean', '한국어', '🇰🇷', '["beginner", "intermediate", "advanced", "expert"]'::jsonb, 'Hangul', 20000),
('ru', 'Russian', 'Русский', '🇷🇺', '["beginner", "intermediate", "advanced", "expert"]'::jsonb, 'Cyrillic', 20000),
('de', 'German', 'Deutsch', '🇩🇪', '["beginner", "intermediate", "advanced", "expert"]'::jsonb, 'Latin', 20000),
('fr', 'French', 'Français', '🇫🇷', '["beginner", "intermediate", "advanced", "expert"]'::jsonb, 'Latin', 20000),
('it', 'Italian', 'Italiano', '🇮🇹', '["beginner", "intermediate", "advanced", "expert"]'::jsonb, 'Latin', 20000)
ON CONFLICT (code) DO NOTHING;

-- Insert shop items data
INSERT INTO shop_items (name, description, price, category, icon, rarity) VALUES
('Taco', 'A delicious taco to fuel your learning', 75, 'cheap', '🌮', 'common'),
('Baguette', 'Fresh French bread for language learners', 130, 'cheap', '🥖', 'common'),
('Cute Chibi Plushie', 'Adorable chibi character plushie', 500, 'cheap', '🧸', 'uncommon'),
('German Cap', 'Traditional German hat', 1000, 'medium', '🎩', 'rare'),
('Flying Potion', 'Magical flying potion', 4000, 'expensive', '🧪', 'epic'),
('Chinese Dragon', 'Majestic Chinese dragon', 10000, 'expensive', '🐉', 'legendary'),
('Golden Retriever', 'Literal golden retriever', 100000, 'expensive', '🐕', 'mythic');

-- Insert achievements data
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
('First Steps', 'Complete your first lesson', '👶', 'lessons_completed', 1, 50),
('Getting Started', 'Earn your first 100 XP', '⭐', 'total_xp', 100, 75),
('Dedicated Learner', 'Study for 7 days in a row', '🔥', 'streak', 7, 100),
('Language Explorer', 'Start learning 3 different languages', '🌍', 'languages_started', 3, 150),
('XP Master', 'Earn 1000 total XP', '💎', 'total_xp', 1000, 200),
('Streak Master', 'Maintain a 30-day streak', '🏆', 'streak', 30, 500);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON user_languages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_language_id ON lessons(language_id);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Note: Add more specific RLS policies as needed for your security requirements