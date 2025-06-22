import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  nickname: varchar("nickname", { length: 100 }),
  profilePicture: text("profile_picture"),
  totalXp: integer("total_xp").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastStudyDate: timestamp("last_study_date"),
  hearts: integer("hearts").default(5).notNull(),
  subscriptionType: varchar("subscription_type", { length: 20 }).default("free").notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  streakFreezeUsed: boolean("streak_freeze_used").default(false).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  nativeName: varchar("native_name", { length: 100 }).notNull(),
  flag: varchar("flag", { length: 10 }).notNull(),
  levels: jsonb("levels").notNull(), // Array of level names
  writingSystem: text("writing_system"),
  totalWords: integer("total_words").default(20000).notNull(),
});

export const userLanguages = pgTable("user_languages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  languageId: integer("language_id").references(() => languages.id).notNull(),
  currentLevel: varchar("current_level", { length: 50 }).default("beginner").notNull(),
  progressPercent: integer("progress_percent").default(0).notNull(),
  wordsLearned: integer("words_learned").default(0).notNull(),
  grammarPointsLearned: integer("grammar_points_learned").default(0).notNull(),
  xpEarned: integer("xp_earned").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  languageId: integer("language_id").references(() => languages.id).notNull(),
  level: varchar("level", { length: 50 }).notNull(),
  lessonNumber: integer("lesson_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").default('').notNull(),
  content: jsonb("content").notNull(), // Questions, vocabulary, etc.
  xpReward: integer("xp_reward").default(25).notNull(),
});

export const userLessonProgress = pgTable("user_lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lessonId: integer("lesson_id").references(() => lessons.id).notNull(),
  completed: boolean("completed").default(false).notNull(),
  progressPercent: integer("progress_percent").default(0).notNull(),
  attemptsCount: integer("attempts_count").default(0).notNull(),
  bestScore: integer("best_score").default(0).notNull(),
  lastAttemptAt: timestamp("last_attempt_at"),
  completedAt: timestamp("completed_at"),
});

export const shopItems = pgTable("shop_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").default(''),
  price: integer("price").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // cheap, medium, expensive
  icon: varchar("icon", { length: 10 }).notNull(),
  rarity: varchar("rarity", { length: 20 }).default("common").notNull(),
});

export const userItems = pgTable("user_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  itemId: integer("item_id").references(() => shopItems.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  acquiredAt: timestamp("acquired_at").defaultNow().notNull(),
});

export const friends = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  friendId: integer("friend_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, accepted, blocked
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tradeOffers = pgTable("trade_offers", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").references(() => users.id).notNull(),
  toUserId: integer("to_user_id").references(() => users.id).notNull(),
  offeredItems: jsonb("offered_items").notNull(), // Array of {itemId, quantity}
  requestedItems: jsonb("requested_items").notNull(), // Array of {itemId, quantity}
  message: text("message").default(''),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, accepted, declined, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  requirement: jsonb("requirement").notNull(), // Condition to unlock
  xpReward: integer("xp_reward").default(0).notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
});

export const dailyStats = pgTable("daily_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  xpEarned: integer("xp_earned").default(0).notNull(),
  lessonsCompleted: integer("lessons_completed").default(0).notNull(),
  wordsLearned: integer("words_learned").default(0).notNull(),
  studyTimeMinutes: integer("study_time_minutes").default(0).notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLanguageSchema = createInsertSchema(languages).omit({
  id: true,
});

export const insertUserLanguageSchema = createInsertSchema(userLanguages).omit({
  id: true,
  createdAt: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
});

export const insertUserLessonProgressSchema = createInsertSchema(userLessonProgress).omit({
  id: true,
});

export const insertShopItemSchema = createInsertSchema(shopItems).omit({
  id: true,
});

export const insertUserItemSchema = createInsertSchema(userItems).omit({
  id: true,
  acquiredAt: true,
});

export const insertFriendSchema = createInsertSchema(friends).omit({
  id: true,
  createdAt: true,
});

export const insertTradeOfferSchema = createInsertSchema(tradeOffers).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertDailyStatSchema = createInsertSchema(dailyStats).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Language = typeof languages.$inferSelect;
export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type UserLanguage = typeof userLanguages.$inferSelect;
export type InsertUserLanguage = z.infer<typeof insertUserLanguageSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type UserLessonProgress = typeof userLessonProgress.$inferSelect;
export type InsertUserLessonProgress = z.infer<typeof insertUserLessonProgressSchema>;
export type ShopItem = typeof shopItems.$inferSelect;
export type InsertShopItem = z.infer<typeof insertShopItemSchema>;
export type UserItem = typeof userItems.$inferSelect;
export type InsertUserItem = z.infer<typeof insertUserItemSchema>;
export type Friend = typeof friends.$inferSelect;
export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type TradeOffer = typeof tradeOffers.$inferSelect;
export type InsertTradeOffer = z.infer<typeof insertTradeOfferSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type DailyStat = typeof dailyStats.$inferSelect;
export type InsertDailyStat = z.infer<typeof insertDailyStatSchema>;
