import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  users, languages, userLanguages, lessons, userLessonProgress, 
  shopItems, userItems, friends, tradeOffers, achievements, 
  userAchievements, dailyStats,
  type User, type InsertUser, type Language, type InsertLanguage,
  type UserLanguage, type InsertUserLanguage, type Lesson, type InsertLesson,
  type UserLessonProgress, type InsertUserLessonProgress, type ShopItem, type InsertShopItem,
  type UserItem, type InsertUserItem, type Friend, type InsertFriend,
  type TradeOffer, type InsertTradeOffer, type Achievement, type InsertAchievement,
  type UserAchievement, type InsertUserAchievement, type DailyStat, type InsertDailyStat
} from '../shared/schema';
import { IStorage } from './storage';
import { LANGUAGES } from '../client/src/data/languages';
import { SHOP_ITEMS } from '../client/src/data/shop-items';

export class DbStorage implements IStorage {
  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Check if languages exist, if not initialize them
      const existingLanguages = await db.select().from(languages).limit(1);
      if (existingLanguages.length === 0) {
        // Insert languages
        for (const lang of LANGUAGES) {
          await db.insert(languages).values({
            name: lang.name,
            code: lang.code,
            nativeName: lang.nativeName,
            flag: lang.flag,
            levels: lang.levels,
            writingSystem: lang.writingSystem || '',
            totalWords: 20000
          });
        }

        // Check if shop items exist
        const existingItems = await db.select().from(shopItems).limit(1);
        if (existingItems.length === 0) {
          // Shop items will be populated via SQL
          console.log('Shop items will be populated via direct SQL insertion');
        }

        // Insert achievements
        const achievementData = [
          { name: "First Lesson", description: "Complete your first lesson", icon: "🎯", requirement: { type: "lessons", count: 1 }, xpReward: 10 },
          { name: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", requirement: { type: "streak", count: 7 }, xpReward: 50 },
          { name: "Polyglot", description: "Study 3 different languages", icon: "🌍", requirement: { type: "languages", count: 3 }, xpReward: 100 },
          { name: "Scholar", description: "Earn 1000 XP", icon: "📚", requirement: { type: "xp", count: 1000 }, xpReward: 25 },
          { name: "Dedicated", description: "Study for 30 days", icon: "💎", requirement: { type: "days", count: 30 }, xpReward: 200 }
        ];

        for (const ach of achievementData) {
          await db.insert(achievements).values(ach);
        }
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    const user = result[0];
    return user ? {
      ...user,
      nickname: user.nickname || null,
      profilePicture: user.profilePicture || null
    } : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    const user = result[0];
    return user ? {
      ...user,
      nickname: user.nickname || null,
      profilePicture: user.profilePicture || null
    } : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    const user = result[0];
    return user ? {
      ...user,
      nickname: user.nickname || null,
      profilePicture: user.profilePicture || null
    } : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const userData = {
      ...user,
      nickname: user.nickname || null,
      profilePicture: user.profilePicture || null
    };
    const result = await db.insert(users).values(userData).returning();
    return {
      ...result[0],
      nickname: result[0].nickname || null,
      profilePicture: result[0].profilePicture || null
    };
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Languages
  async getAllLanguages(): Promise<Language[]> {
    const result = await db.select().from(languages);
    return result.map(lang => ({
      ...lang,
      writingSystem: lang.writingSystem || null,
      totalWords: lang.totalWords || 20000
    }));
  }

  async getLanguage(id: number): Promise<Language | undefined> {
    const result = await db.select().from(languages).where(eq(languages.id, id));
    const lang = result[0];
    return lang ? {
      ...lang,
      writingSystem: lang.writingSystem || null,
      totalWords: lang.totalWords || 20000
    } : undefined;
  }

  async getLanguageByCode(code: string): Promise<Language | undefined> {
    const result = await db.select().from(languages).where(eq(languages.code, code));
    const lang = result[0];
    return lang ? {
      ...lang,
      writingSystem: lang.writingSystem || null,
      totalWords: lang.totalWords || 20000
    } : undefined;
  }

  async createLanguage(language: InsertLanguage): Promise<Language> {
    const result = await db.insert(languages).values(language).returning();
    return result[0];
  }

  // User Languages
  async getUserLanguages(userId: number): Promise<UserLanguage[]> {
    return await db.select().from(userLanguages).where(eq(userLanguages.userId, userId));
  }

  async getUserLanguage(userId: number, languageId: number): Promise<UserLanguage | undefined> {
    const result = await db.select().from(userLanguages)
      .where(and(eq(userLanguages.userId, userId), eq(userLanguages.languageId, languageId)));
    return result[0];
  }

  async createUserLanguage(userLanguage: InsertUserLanguage): Promise<UserLanguage> {
    const result = await db.insert(userLanguages).values(userLanguage).returning();
    return result[0];
  }

  async updateUserLanguage(id: number, updates: Partial<InsertUserLanguage>): Promise<UserLanguage | undefined> {
    const result = await db.update(userLanguages)
      .set(updates)
      .where(eq(userLanguages.id, id))
      .returning();
    return result[0];
  }

  // Lessons
  async getLessonsByLanguage(languageId: number, level?: string): Promise<Lesson[]> {
    if (level) {
      return await db.select().from(lessons)
        .where(and(eq(lessons.languageId, languageId), eq(lessons.level, level)));
    }
    return await db.select().from(lessons).where(eq(lessons.languageId, languageId));
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const result = await db.select().from(lessons).where(eq(lessons.id, id));
    return result[0];
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const lessonData = {
      ...lesson,
      description: lesson.description || '',
      xpReward: lesson.xpReward || 25
    };
    const result = await db.insert(lessons).values(lessonData).returning();
    return {
      ...result[0],
      description: result[0].description || '',
      xpReward: result[0].xpReward || 25
    };
  }

  // User Lesson Progress
  async getUserLessonProgress(userId: number, lessonId: number): Promise<UserLessonProgress | undefined> {
    const result = await db.select().from(userLessonProgress)
      .where(and(eq(userLessonProgress.userId, userId), eq(userLessonProgress.lessonId, lessonId)));
    return result[0];
  }

  async getUserLessonProgressByLanguage(userId: number, languageId: number): Promise<UserLessonProgress[]> {
    return await db.select()
      .from(userLessonProgress)
      .innerJoin(lessons, eq(userLessonProgress.lessonId, lessons.id))
      .where(and(eq(userLessonProgress.userId, userId), eq(lessons.languageId, languageId)))
      .then(results => results.map(r => r.user_lesson_progress));
  }

  async createUserLessonProgress(progress: InsertUserLessonProgress): Promise<UserLessonProgress> {
    const result = await db.insert(userLessonProgress).values(progress).returning();
    return result[0];
  }

  async updateUserLessonProgress(id: number, updates: Partial<InsertUserLessonProgress>): Promise<UserLessonProgress | undefined> {
    const result = await db.update(userLessonProgress)
      .set(updates)
      .where(eq(userLessonProgress.id, id))
      .returning();
    return result[0];
  }

  // Shop Items
  async getAllShopItems(): Promise<ShopItem[]> {
    return await db.select().from(shopItems);
  }

  async getShopItem(id: number): Promise<ShopItem | undefined> {
    const result = await db.select().from(shopItems).where(eq(shopItems.id, id));
    return result[0];
  }

  async createShopItem(item: InsertShopItem): Promise<ShopItem> {
    const itemData = {
      ...item,
      description: item.description || null,
      rarity: item.rarity || 'common'
    };
    const result = await db.insert(shopItems).values(itemData).returning();
    return {
      ...result[0],
      description: result[0].description || null,
      rarity: result[0].rarity || 'common'
    };
  }

  // User Items
  async getUserItems(userId: number): Promise<UserItem[]> {
    return await db.select().from(userItems).where(eq(userItems.userId, userId));
  }

  async getUserItem(userId: number, itemId: number): Promise<UserItem | undefined> {
    const result = await db.select().from(userItems)
      .where(and(eq(userItems.userId, userId), eq(userItems.itemId, itemId)));
    return result[0];
  }

  async createUserItem(userItem: InsertUserItem): Promise<UserItem> {
    const result = await db.insert(userItems).values(userItem).returning();
    return result[0];
  }

  async updateUserItem(id: number, updates: Partial<InsertUserItem>): Promise<UserItem | undefined> {
    const result = await db.update(userItems)
      .set(updates)
      .where(eq(userItems.id, id))
      .returning();
    return result[0];
  }

  // Friends
  async getUserFriends(userId: number): Promise<Friend[]> {
    return await db.select().from(friends)
      .where(and(
        eq(friends.userId, userId),
        eq(friends.status, 'accepted')
      ));
  }

  async getFriendship(userId: number, friendId: number): Promise<Friend | undefined> {
    const result = await db.select().from(friends)
      .where(and(eq(friends.userId, userId), eq(friends.friendId, friendId)));
    return result[0];
  }

  async createFriendship(friendship: InsertFriend): Promise<Friend> {
    const result = await db.insert(friends).values(friendship).returning();
    return result[0];
  }

  async updateFriendship(id: number, updates: Partial<InsertFriend>): Promise<Friend | undefined> {
    const result = await db.update(friends)
      .set(updates)
      .where(eq(friends.id, id))
      .returning();
    return result[0];
  }

  // Trade Offers
  async getUserTradeOffers(userId: number): Promise<TradeOffer[]> {
    return await db.select().from(tradeOffers)
      .where(eq(tradeOffers.toUserId, userId));
  }

  async getTradeOffer(id: number): Promise<TradeOffer | undefined> {
    const result = await db.select().from(tradeOffers).where(eq(tradeOffers.id, id));
    return result[0];
  }

  async createTradeOffer(offer: InsertTradeOffer): Promise<TradeOffer> {
    const result = await db.insert(tradeOffers).values(offer).returning();
    return result[0];
  }

  async updateTradeOffer(id: number, updates: Partial<InsertTradeOffer>): Promise<TradeOffer | undefined> {
    const result = await db.update(tradeOffers)
      .set(updates)
      .where(eq(tradeOffers.id, id))
      .returning();
    return result[0];
  }

  // Achievements
  async getAllAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  }

  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const result = await db.insert(userAchievements).values(userAchievement).returning();
    return result[0];
  }

  // Daily Stats
  async getUserDailyStats(userId: number, days = 7): Promise<DailyStat[]> {
    return await db.select().from(dailyStats)
      .where(eq(dailyStats.userId, userId))
      .orderBy(desc(dailyStats.date))
      .limit(days);
  }

  async createDailyStat(stat: InsertDailyStat): Promise<DailyStat> {
    const result = await db.insert(dailyStats).values(stat).returning();
    return result[0];
  }

  // Leaderboard
  async getLeaderboard(limit = 10): Promise<User[]> {
    return await db.select().from(users)
      .orderBy(desc(users.totalXp))
      .limit(limit);
  }
}