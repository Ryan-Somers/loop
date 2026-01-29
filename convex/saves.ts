import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const save = mutation({
  args: {
    userId: v.id("users"),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // Check if already saved
    const existing = await ctx.db
      .query("saves")
      .withIndex("by_user_and_post", (q) =>
        q.eq("user", args.userId).eq("post", args.postId)
      )
      .first();

    if (existing) {
      return existing;
    }

    const saveId = await ctx.db.insert("saves", {
      user: args.userId,
      post: args.postId,
    });

    return await ctx.db.get(saveId);
  },
});

export const unsave = mutation({
  args: { saveId: v.id("saves") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.saveId);
    return { success: true };
  },
});

export const unsaveByUserAndPost = mutation({
  args: {
    userId: v.id("users"),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const save = await ctx.db
      .query("saves")
      .withIndex("by_user_and_post", (q) =>
        q.eq("user", args.userId).eq("post", args.postId)
      )
      .first();

    if (save) {
      await ctx.db.delete(save._id);
    }

    return { success: true };
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const saves = await ctx.db
      .query("saves")
      .withIndex("by_user", (q) => q.eq("user", args.userId))
      .collect();

    // Fetch post details for each save
    const savesWithPost = await Promise.all(
      saves.map(async (save) => {
        const post = await ctx.db.get(save.post);
        if (!post) return null;
        const creator = await ctx.db.get(post.creator);
        return { ...save, post: { ...post, creator } };
      })
    );

    return savesWithPost.filter(Boolean);
  },
});

export const getSaveRecord = query({
  args: {
    userId: v.id("users"),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("saves")
      .withIndex("by_user_and_post", (q) =>
        q.eq("user", args.userId).eq("post", args.postId)
      )
      .first();
  },
});
