import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simple hash function for demo - in production use bcrypt via an action
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16) + password.length.toString(16);
}

function generateToken(): string {
  return Math.random().toString(36).substring(2) +
         Math.random().toString(36).substring(2) +
         Date.now().toString(36);
}

export const createAccount = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existingEmail) {
      throw new Error("Email already in use");
    }

    // Check if username already exists
    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    if (existingUsername) {
      throw new Error("Username already taken");
    }

    // Create user with avatar URL using UI Avatars service
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(args.name)}&background=random`;

    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: simpleHash(args.password),
      name: args.name,
      username: args.username,
      imageUrl: avatarUrl,
      bio: "",
    });

    // Create session
    const token = generateToken();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
    });

    const user = await ctx.db.get(userId);
    return { user, token };
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.passwordHash !== simpleHash(args.password)) {
      throw new Error("Invalid email or password");
    }

    // Create new session
    const token = generateToken();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
    });

    return { user, token };
  },
});

export const signOut = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

export const getCurrentUser = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    if (!args.token) return null;

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    // Fetch user's saves with post details
    const saves = await ctx.db
      .query("saves")
      .withIndex("by_user", (q) => q.eq("user", session.userId))
      .collect();

    const savesWithPosts = await Promise.all(
      saves.map(async (save) => {
        const post = await ctx.db.get(save.post);
        return { ...save, post };
      })
    );

    return { ...user, saves: savesWithPosts };
  },
});

export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    if (!args.token) return { valid: false, userId: null };

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return { valid: false, userId: null };
    }

    return { valid: true, userId: session.userId };
  },
});
