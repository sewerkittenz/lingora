import type { Express } from "express";
import { createServer, type Server } from "http";
import { DbStorage } from "./db-storage";

const storage = new DbStorage();
import bcrypt from "bcrypt";
import { insertUserSchema, insertUserLanguageSchema, insertUserLessonProgressSchema, insertTradeOfferSchema, insertFriendSchema, insertUserItemSchema } from "@shared/schema";
import { z } from "zod";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, confirmPassword } = req.body;
      
      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }

      const existingUser = await storage.getUserByEmail(email) || await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        nickname: username,
        profilePicture: null,
      });

      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.json({ user: userResponse });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username) || await storage.getUserByEmail(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.json({ user: userResponse });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({ message: "If email exists, password reset instructions have been sent" });
      }

      // In a real app, you'd send an email here
      res.json({ message: "Password reset instructions sent to email" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      // In a real app, you'd validate the token here
      // For now, we'll just simulate success
      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Language routes
  app.get("/api/languages", async (req, res) => {
    try {
      const languages = await storage.getAllLanguages();
      res.json(languages);
    } catch (error) {
      console.error("Get languages error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/languages/:code", async (req, res) => {
    try {
      const code = req.params.code;
      const language = await storage.getLanguageByCode(code);
      
      if (!language) {
        return res.status(404).json({ error: "Language not found" });
      }

      res.json(language);
    } catch (error) {
      console.error("Get language error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User language routes
  app.get("/api/users/:userId/languages", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userLanguages = await storage.getUserLanguages(userId);
      res.json(userLanguages);
    } catch (error) {
      console.error("Get user languages error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users/:userId/languages", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { languageId } = req.body;
      
      const existingUserLanguage = await storage.getUserLanguage(userId, languageId);
      if (existingUserLanguage) {
        return res.status(400).json({ error: "Language already added" });
      }

      const userLanguage = await storage.createUserLanguage({
        userId,
        languageId,
        currentLevel: 'beginner',
      });

      res.json(userLanguage);
    } catch (error) {
      console.error("Add user language error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Lesson routes
  app.get("/api/languages/:languageId/lessons", async (req, res) => {
    try {
      const languageId = parseInt(req.params.languageId);
      const level = req.query.level as string;
      
      const lessons = await storage.getLessonsByLanguage(languageId, level);
      res.json(lessons);
    } catch (error) {
      console.error("Get lessons error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLesson(lessonId);
      
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      res.json(lesson);
    } catch (error) {
      console.error("Get lesson error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User lesson progress routes
  app.get("/api/users/:userId/lessons/:lessonId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const lessonId = parseInt(req.params.lessonId);
      
      const progress = await storage.getUserLessonProgress(userId, lessonId);
      res.json(progress || null);
    } catch (error) {
      console.error("Get lesson progress error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users/:userId/lessons/:lessonId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const lessonId = parseInt(req.params.lessonId);
      const { progressPercent, score, completed } = req.body;

      let progress = await storage.getUserLessonProgress(userId, lessonId);
      
      if (!progress) {
        progress = await storage.createUserLessonProgress({
          userId,
          lessonId,
        });
      }

      const updates: any = { lastAttemptAt: new Date() };
      if (progressPercent !== undefined) updates.progressPercent = progressPercent;
      if (score !== undefined && score > progress.bestScore) updates.bestScore = score;
      if (completed) {
        updates.completed = true;
        updates.completedAt = new Date();
      }
      updates.attemptsCount = progress.attemptsCount + 1;

      const updatedProgress = await storage.updateUserLessonProgress(progress.id, updates);
      res.json(updatedProgress);
    } catch (error) {
      console.error("Update lesson progress error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Shop routes
  app.get("/api/shop/items", async (req, res) => {
    try {
      const items = await storage.getAllShopItems();
      res.json(items);
    } catch (error) {
      console.error("Get shop items error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/shop/purchase", async (req, res) => {
    try {
      const { userId, itemId } = req.body;
      
      const user = await storage.getUser(userId);
      const item = await storage.getShopItem(itemId);
      
      if (!user || !item) {
        return res.status(404).json({ error: "User or item not found" });
      }

      if (user.totalXp < item.price) {
        return res.status(400).json({ error: "Insufficient XP" });
      }

      // Deduct XP
      await storage.updateUser(userId, { totalXp: user.totalXp - item.price });

      // Add item to user's collection
      const existingUserItem = await storage.getUserItem(userId, itemId);
      if (existingUserItem) {
        await storage.updateUserItem(existingUserItem.id, { 
          quantity: existingUserItem.quantity + 1 
        });
      } else {
        await storage.createUserItem({ userId, itemId, quantity: 1 });
      }

      res.json({ message: "Purchase successful" });
    } catch (error) {
      console.error("Purchase error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User items routes
  app.get("/api/users/:userId/items", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userItems = await storage.getUserItems(userId);
      res.json(userItems);
    } catch (error) {
      console.error("Get user items error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Friends routes
  app.get("/api/users/:userId/friends", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const friends = await storage.getUserFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error("Get friends error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users/:userId/friends", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { friendId } = req.body;
      
      const existingFriendship = await storage.getFriendship(userId, friendId);
      if (existingFriendship) {
        return res.status(400).json({ error: "Friendship already exists" });
      }

      const friendship = await storage.createFriendship({
        userId,
        friendId,
        status: 'pending',
      });

      res.json(friendship);
    } catch (error) {
      console.error("Add friend error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/friendships/:id", async (req, res) => {
    try {
      const friendshipId = parseInt(req.params.id);
      const { status } = req.body;
      
      const friendship = await storage.updateFriendship(friendshipId, { status });
      if (!friendship) {
        return res.status(404).json({ error: "Friendship not found" });
      }

      res.json(friendship);
    } catch (error) {
      console.error("Update friendship error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Trade routes
  app.get("/api/users/:userId/trades", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const trades = await storage.getUserTradeOffers(userId);
      res.json(trades);
    } catch (error) {
      console.error("Get trades error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/trades", async (req, res) => {
    try {
      const { fromUserId, toUserId, offeredItems, requestedItems, message } = req.body;
      
      const trade = await storage.createTradeOffer({
        fromUserId,
        toUserId,
        offeredItems,
        requestedItems,
        message,
      });

      res.json(trade);
    } catch (error) {
      console.error("Create trade error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/trades/:id", async (req, res) => {
    try {
      const tradeId = parseInt(req.params.id);
      const { status } = req.body;
      
      const trade = await storage.updateTradeOffer(tradeId, { 
        status,
        respondedAt: new Date()
      });
      
      if (!trade) {
        return res.status(404).json({ error: "Trade not found" });
      }

      res.json(trade);
    } catch (error) {
      console.error("Update trade error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      console.error("Get user achievements error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await storage.getLeaderboard(limit);
      
      // Remove passwords from response
      const safeUsers = users.map(({ password: _, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Get leaderboard error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Daily stats routes
  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const days = parseInt(req.query.days as string) || 30;
      
      const stats = await storage.getUserDailyStats(userId, days);
      res.json(stats);
    } catch (error) {
      console.error("Get user stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // PayPal routes
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    // Request body should contain: { intent, amount, currency }
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  const httpServer = createServer(app);
  return httpServer;
}
