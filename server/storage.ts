import { 
  users, languages, userLanguages, lessons, userLessonProgress, 
  shopItems, userItems, friends, tradeOffers, achievements, 
  userAchievements, dailyStats,
  type User, type InsertUser, type Language, type InsertLanguage,
  type UserLanguage, type InsertUserLanguage, type Lesson, type InsertLesson,
  type UserLessonProgress, type InsertUserLessonProgress,
  type ShopItem, type InsertShopItem, type UserItem, type InsertUserItem,
  type Friend, type InsertFriend, type TradeOffer, type InsertTradeOffer,
  type Achievement, type InsertAchievement, type UserAchievement, type InsertUserAchievement,
  type DailyStat, type InsertDailyStat
} from "@shared/schema";
import { eq, desc, and, or, gte, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Languages
  getAllLanguages(): Promise<Language[]>;
  getLanguage(id: number): Promise<Language | undefined>;
  getLanguageByCode(code: string): Promise<Language | undefined>;
  createLanguage(language: InsertLanguage): Promise<Language>;
  
  // User Languages
  getUserLanguages(userId: number): Promise<UserLanguage[]>;
  getUserLanguage(userId: number, languageId: number): Promise<UserLanguage | undefined>;
  createUserLanguage(userLanguage: InsertUserLanguage): Promise<UserLanguage>;
  updateUserLanguage(id: number, updates: Partial<InsertUserLanguage>): Promise<UserLanguage | undefined>;
  
  // Lessons
  getLessonsByLanguage(languageId: number, level?: string): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  
  // User Lesson Progress
  getUserLessonProgress(userId: number, lessonId: number): Promise<UserLessonProgress | undefined>;
  getUserLessonProgressByLanguage(userId: number, languageId: number): Promise<UserLessonProgress[]>;
  createUserLessonProgress(progress: InsertUserLessonProgress): Promise<UserLessonProgress>;
  updateUserLessonProgress(id: number, updates: Partial<InsertUserLessonProgress>): Promise<UserLessonProgress | undefined>;
  
  // Shop Items
  getAllShopItems(): Promise<ShopItem[]>;
  getShopItem(id: number): Promise<ShopItem | undefined>;
  createShopItem(item: InsertShopItem): Promise<ShopItem>;
  
  // User Items
  getUserItems(userId: number): Promise<UserItem[]>;
  getUserItem(userId: number, itemId: number): Promise<UserItem | undefined>;
  createUserItem(userItem: InsertUserItem): Promise<UserItem>;
  updateUserItem(id: number, updates: Partial<InsertUserItem>): Promise<UserItem | undefined>;
  
  // Friends
  getUserFriends(userId: number): Promise<Friend[]>;
  getFriendship(userId: number, friendId: number): Promise<Friend | undefined>;
  createFriendship(friendship: InsertFriend): Promise<Friend>;
  updateFriendship(id: number, updates: Partial<InsertFriend>): Promise<Friend | undefined>;
  
  // Trade Offers
  getUserTradeOffers(userId: number): Promise<TradeOffer[]>;
  getTradeOffer(id: number): Promise<TradeOffer | undefined>;
  createTradeOffer(offer: InsertTradeOffer): Promise<TradeOffer>;
  updateTradeOffer(id: number, updates: Partial<InsertTradeOffer>): Promise<TradeOffer | undefined>;
  
  // Achievements
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  
  // Daily Stats
  getUserDailyStats(userId: number, days?: number): Promise<DailyStat[]>;
  createDailyStat(stat: InsertDailyStat): Promise<DailyStat>;
  
  // Leaderboard
  getLeaderboard(limit?: number): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private languages: Map<number, Language>;
  private userLanguages: Map<number, UserLanguage>;
  private lessons: Map<number, Lesson>;
  private userLessonProgress: Map<number, UserLessonProgress>;
  private shopItems: Map<number, ShopItem>;
  private userItems: Map<number, UserItem>;
  private friends: Map<number, Friend>;
  private tradeOffers: Map<number, TradeOffer>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private dailyStats: Map<number, DailyStat>;
  
  private currentUserId: number;
  private currentLanguageId: number;
  private currentUserLanguageId: number;
  private currentLessonId: number;
  private currentUserLessonProgressId: number;
  private currentShopItemId: number;
  private currentUserItemId: number;
  private currentFriendId: number;
  private currentTradeOfferId: number;
  private currentAchievementId: number;
  private currentUserAchievementId: number;
  private currentDailyStatId: number;

  constructor() {
    this.users = new Map();
    this.languages = new Map();
    this.userLanguages = new Map();
    this.lessons = new Map();
    this.userLessonProgress = new Map();
    this.shopItems = new Map();
    this.userItems = new Map();
    this.friends = new Map();
    this.tradeOffers = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.dailyStats = new Map();
    
    this.currentUserId = 1;
    this.currentLanguageId = 1;
    this.currentUserLanguageId = 1;
    this.currentLessonId = 1;
    this.currentUserLessonProgressId = 1;
    this.currentShopItemId = 1;
    this.currentUserItemId = 1;
    this.currentFriendId = 1;
    this.currentTradeOfferId = 1;
    this.currentAchievementId = 1;
    this.currentUserAchievementId = 1;
    this.currentDailyStatId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize languages
    const languagesData = [
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', levels: ['kana', 'jlpt-n5', 'jlpt-n4', 'jlpt-n3', 'jlpt-n2', 'jlpt-n1'], writingSystem: 'Hiragana, Katakana, Kanji', totalWords: 20000 },
      { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', levels: ['beginner', 'intermediate', 'advanced', 'expert'], writingSystem: 'Simplified Chinese Characters', totalWords: 20000 },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', levels: ['beginner', 'intermediate', 'advanced', 'expert'], writingSystem: null, totalWords: 20000 },
      { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', levels: ['beginner', 'intermediate', 'advanced', 'expert'], writingSystem: 'Hangul', totalWords: 20000 },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', levels: ['beginner', 'intermediate', 'advanced', 'expert'], writingSystem: 'Cyrillic', totalWords: 20000 },
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', levels: ['beginner', 'intermediate', 'advanced', 'expert'], writingSystem: null, totalWords: 20000 },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', levels: ['beginner', 'intermediate', 'advanced', 'expert'], writingSystem: null, totalWords: 20000 },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', levels: ['beginner', 'intermediate', 'advanced', 'expert'], writingSystem: null, totalWords: 20000 },
      { code: 'hr', name: 'Serbo-Croatian', nativeName: 'Српскохрватски', flag: '🇭🇷', levels: ['beginner', 'intermediate', 'advanced', 'expert'], writingSystem: 'Cyrillic', totalWords: 20000 },
    ];

    languagesData.forEach(lang => {
      const language: Language = { 
        id: this.currentLanguageId++, 
        ...lang,
        writingSystem: lang.writingSystem || null,
        totalWords: lang.totalWords || 20000
      };
      this.languages.set(language.id, language);
    });

    // Initialize shop items
    const shopItemsData = [
      { name: 'Taco', description: 'Delicious taco', price: 75, category: 'cheap', icon: '🌮', rarity: 'common' },
      { name: 'Baguette', description: 'French bread', price: 130, category: 'cheap', icon: '🥖', rarity: 'common' },
      { name: 'Pasta', description: 'Italian pasta', price: 280, category: 'cheap', icon: '🍝', rarity: 'common' },
      { name: 'Cute Chibi Plushie', description: 'Adorable plushie', price: 500, category: 'cheap', icon: '🧸', rarity: 'uncommon' },
      { name: 'Game Console', description: 'Gaming console', price: 800, category: 'cheap', icon: '🎮', rarity: 'uncommon' },
      { name: 'German Cap', description: 'Traditional German hat', price: 1000, category: 'medium', icon: '🎩', rarity: 'rare' },
      { name: 'Chocolate Bigfoot', description: 'Mysterious chocolate creature', price: 1800, category: 'medium', icon: '🍫', rarity: 'rare' },
      { name: 'Hinamatsuri Doll', description: 'Japanese festival doll', price: 2500, category: 'medium', icon: '🎎', rarity: 'rare' },
      { name: 'Matryoshka Dolls', description: 'Russian nesting dolls', price: 3700, category: 'medium', icon: '🪆', rarity: 'epic' },
      { name: 'Flying Potion', description: 'Magical flying potion', price: 4000, category: 'expensive', icon: '🧪', rarity: 'epic' },
      { name: 'Chinese Dragon', description: 'Legendary dragon', price: 10000, category: 'expensive', icon: '🐉', rarity: 'legendary' },
      { name: 'Eiffel Tower', description: 'Iconic French tower', price: 36000, category: 'expensive', icon: '🗼', rarity: 'legendary' },
      { name: 'Enchanted Book', description: 'Magical spellbook', price: 50000, category: 'expensive', icon: '📚', rarity: 'legendary' },
      { name: 'Private Island', description: 'Your own island paradise', price: 80000, category: 'expensive', icon: '🏝️', rarity: 'mythic' },
      { name: 'Golden Retriever', description: 'Literal golden retriever', price: 100000, category: 'expensive', icon: '🐕', rarity: 'mythic' },
    ];

    shopItemsData.forEach(item => {
      const shopItem: ShopItem = { id: this.currentShopItemId++, ...item };
      this.shopItems.set(shopItem.id, shopItem);
    });

    // Initialize achievements
    const achievementsData = [
      { name: 'Fire Starter', description: 'Start a 7-day streak', icon: 'fas fa-fire', requirement: { type: 'streak', value: 7 }, xpReward: 100 },
      { name: 'Word Master', description: 'Learn 1000 words', icon: 'fas fa-graduation-cap', requirement: { type: 'words', value: 1000 }, xpReward: 500 },
      { name: 'Polyglot', description: 'Master 5 languages', icon: 'fas fa-trophy', requirement: { type: 'languages', value: 5 }, xpReward: 1000 },
      { name: 'Dedicated Learner', description: 'Study for 30 days straight', icon: 'fas fa-calendar-check', requirement: { type: 'streak', value: 30 }, xpReward: 300 },
      { name: 'Speed Demon', description: 'Complete 10 lessons in one day', icon: 'fas fa-bolt', requirement: { type: 'daily_lessons', value: 10 }, xpReward: 200 },
    ];

    achievementsData.forEach(achievement => {
      const ach: Achievement = { id: this.currentAchievementId++, ...achievement };
      this.achievements.set(ach.id, ach);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      nickname: insertUser.nickname || null,
      profilePicture: insertUser.profilePicture || null,
      totalXp: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      hearts: 5,
      subscriptionType: 'free',
      subscriptionExpiresAt: null,
      streakFreezeUsed: false,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Languages
  async getAllLanguages(): Promise<Language[]> {
    return Array.from(this.languages.values());
  }

  async getLanguage(id: number): Promise<Language | undefined> {
    return this.languages.get(id);
  }

  async getLanguageByCode(code: string): Promise<Language | undefined> {
    return Array.from(this.languages.values()).find(lang => lang.code === code);
  }

  async createLanguage(language: InsertLanguage): Promise<Language> {
    const id = this.currentLanguageId++;
    const lang: Language = { ...language, id };
    this.languages.set(id, lang);
    return lang;
  }

  // User Languages
  async getUserLanguages(userId: number): Promise<UserLanguage[]> {
    return Array.from(this.userLanguages.values()).filter(ul => ul.userId === userId);
  }

  async getUserLanguage(userId: number, languageId: number): Promise<UserLanguage | undefined> {
    return Array.from(this.userLanguages.values()).find(ul => ul.userId === userId && ul.languageId === languageId);
  }

  async createUserLanguage(userLanguage: InsertUserLanguage): Promise<UserLanguage> {
    const id = this.currentUserLanguageId++;
    const ul: UserLanguage = {
      ...userLanguage,
      id,
      currentLevel: userLanguage.currentLevel || 'beginner',
      progressPercent: 0,
      wordsLearned: 0,
      grammarPointsLearned: 0,
      xpEarned: 0,
      createdAt: new Date(),
    };
    this.userLanguages.set(id, ul);
    return ul;
  }

  async updateUserLanguage(id: number, updates: Partial<InsertUserLanguage>): Promise<UserLanguage | undefined> {
    const userLanguage = this.userLanguages.get(id);
    if (!userLanguage) return undefined;
    
    const updated: UserLanguage = { ...userLanguage, ...updates };
    this.userLanguages.set(id, updated);
    return updated;
  }

  // Lessons
  async getLessonsByLanguage(languageId: number, level?: string): Promise<Lesson[]> {
    return Array.from(this.lessons.values()).filter(lesson => 
      lesson.languageId === languageId && (!level || lesson.level === level)
    );
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const id = this.currentLessonId++;
    const l: Lesson = { 
      ...lesson, 
      id,
      description: lesson.description || '',
      xpReward: lesson.xpReward || 25
    };
    this.lessons.set(id, l);
    return l;
  }

  // User Lesson Progress
  async getUserLessonProgress(userId: number, lessonId: number): Promise<UserLessonProgress | undefined> {
    return Array.from(this.userLessonProgress.values()).find(ulp => 
      ulp.userId === userId && ulp.lessonId === lessonId
    );
  }

  async getUserLessonProgressByLanguage(userId: number, languageId: number): Promise<UserLessonProgress[]> {
    const lessons = await this.getLessonsByLanguage(languageId);
    const lessonIds = lessons.map(l => l.id);
    return Array.from(this.userLessonProgress.values()).filter(ulp => 
      ulp.userId === userId && lessonIds.includes(ulp.lessonId)
    );
  }

  async createUserLessonProgress(progress: InsertUserLessonProgress): Promise<UserLessonProgress> {
    const id = this.currentUserLessonProgressId++;
    const ulp: UserLessonProgress = {
      ...progress,
      id,
      completed: false,
      progressPercent: 0,
      attemptsCount: 0,
      bestScore: 0,
      lastAttemptAt: null,
      completedAt: null,
    };
    this.userLessonProgress.set(id, ulp);
    return ulp;
  }

  async updateUserLessonProgress(id: number, updates: Partial<InsertUserLessonProgress>): Promise<UserLessonProgress | undefined> {
    const progress = this.userLessonProgress.get(id);
    if (!progress) return undefined;
    
    const updated: UserLessonProgress = { ...progress, ...updates };
    this.userLessonProgress.set(id, updated);
    return updated;
  }

  // Shop Items
  async getAllShopItems(): Promise<ShopItem[]> {
    return Array.from(this.shopItems.values());
  }

  async getShopItem(id: number): Promise<ShopItem | undefined> {
    return this.shopItems.get(id);
  }

  async createShopItem(item: InsertShopItem): Promise<ShopItem> {
    const id = this.currentShopItemId++;
    const shopItem: ShopItem = { 
      ...item, 
      id,
      description: item.description || null,
      rarity: item.rarity || 'common'
    };
    this.shopItems.set(id, shopItem);
    return shopItem;
  }

  // User Items
  async getUserItems(userId: number): Promise<UserItem[]> {
    return Array.from(this.userItems.values()).filter(ui => ui.userId === userId);
  }

  async getUserItem(userId: number, itemId: number): Promise<UserItem | undefined> {
    return Array.from(this.userItems.values()).find(ui => ui.userId === userId && ui.itemId === itemId);
  }

  async createUserItem(userItem: InsertUserItem): Promise<UserItem> {
    const id = this.currentUserItemId++;
    const ui: UserItem = {
      ...userItem,
      id,
      quantity: userItem.quantity || 1,
      acquiredAt: new Date(),
    };
    this.userItems.set(id, ui);
    return ui;
  }

  async updateUserItem(id: number, updates: Partial<InsertUserItem>): Promise<UserItem | undefined> {
    const userItem = this.userItems.get(id);
    if (!userItem) return undefined;
    
    const updated: UserItem = { ...userItem, ...updates };
    this.userItems.set(id, updated);
    return updated;
  }

  // Friends
  async getUserFriends(userId: number): Promise<Friend[]> {
    return Array.from(this.friends.values()).filter(f => 
      (f.userId === userId || f.friendId === userId) && f.status === 'accepted'
    );
  }

  async getFriendship(userId: number, friendId: number): Promise<Friend | undefined> {
    return Array.from(this.friends.values()).find(f => 
      (f.userId === userId && f.friendId === friendId) || 
      (f.userId === friendId && f.friendId === userId)
    );
  }

  async createFriendship(friendship: InsertFriend): Promise<Friend> {
    const id = this.currentFriendId++;
    const f: Friend = {
      ...friendship,
      id,
      status: 'pending',
      createdAt: new Date(),
    };
    this.friends.set(id, f);
    return f;
  }

  async updateFriendship(id: number, updates: Partial<InsertFriend>): Promise<Friend | undefined> {
    const friendship = this.friends.get(id);
    if (!friendship) return undefined;
    
    const updated: Friend = { ...friendship, ...updates };
    this.friends.set(id, updated);
    return updated;
  }

  // Trade Offers
  async getUserTradeOffers(userId: number): Promise<TradeOffer[]> {
    return Array.from(this.tradeOffers.values()).filter(to => 
      to.fromUserId === userId || to.toUserId === userId
    );
  }

  async getTradeOffer(id: number): Promise<TradeOffer | undefined> {
    return this.tradeOffers.get(id);
  }

  async createTradeOffer(offer: InsertTradeOffer): Promise<TradeOffer> {
    const id = this.currentTradeOfferId++;
    const to: TradeOffer = {
      ...offer,
      id,
      status: 'pending',
      createdAt: new Date(),
      respondedAt: null,
    };
    this.tradeOffers.set(id, to);
    return to;
  }

  async updateTradeOffer(id: number, updates: Partial<InsertTradeOffer>): Promise<TradeOffer | undefined> {
    const offer = this.tradeOffers.get(id);
    if (!offer) return undefined;
    
    const updated: TradeOffer = { ...offer, ...updates };
    this.tradeOffers.set(id, updated);
    return updated;
  }

  // Achievements
  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(ua => ua.userId === userId);
  }

  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.currentUserAchievementId++;
    const ua: UserAchievement = {
      ...userAchievement,
      id,
      progress: 0,
      completed: false,
      unlockedAt: new Date(),
    };
    this.userAchievements.set(id, ua);
    return ua;
  }

  // Daily Stats
  async getUserDailyStats(userId: number, days?: number): Promise<DailyStat[]> {
    const stats = Array.from(this.dailyStats.values()).filter(ds => ds.userId === userId);
    if (days) {
      return stats.slice(-days);
    }
    return stats;
  }

  async createDailyStat(stat: InsertDailyStat): Promise<DailyStat> {
    const id = this.currentDailyStatId++;
    const ds: DailyStat = { 
      ...stat, 
      id,
      wordsLearned: stat.wordsLearned || 0,
      xpEarned: stat.xpEarned || 0,
      lessonsCompleted: stat.lessonsCompleted || 0,
      studyTimeMinutes: stat.studyTimeMinutes || 0
    };
    this.dailyStats.set(id, ds);
    return ds;
  }

  // Leaderboard
  async getLeaderboard(limit = 10): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.totalXp - a.totalXp)
      .slice(0, limit);
  }
}

// Use DatabaseStorage instead of MemStorage
import { DbStorage } from "./db-storage";
export const storage = new DbStorage();
