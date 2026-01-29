import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
  },
});

export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Get user's posts
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_creator", (q) => q.eq("creator", args.userId))
      .order("desc")
      .collect();

    // Add creator info to posts
    const postsWithCreator = posts.map((post) => ({
      ...post,
      creator: user,
    }));

    // Get posts the user has liked
    const allPosts = await ctx.db.query("posts").collect();
    const likedPosts = await Promise.all(
      allPosts
        .filter((post) => post.likes.includes(args.userId))
        .map(async (post) => {
          const creator = await ctx.db.get(post.creator);
          return { ...post, creator };
        })
    );

    return {
      ...user,
      posts: postsWithCreator,
      likedPosts,
    };
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(userId, filteredUpdates);
    return await ctx.db.get(userId);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
