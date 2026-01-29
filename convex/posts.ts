import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").take(20);

    // Fetch creator details for each post
    const postsWithCreator = await Promise.all(
      posts.map(async (post) => {
        const creator = await ctx.db.get(post.creator);
        return { ...post, creator };
      })
    );

    return postsWithCreator;
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const posts = await ctx.db.query("posts").order("desc").take(limit);

    const postsWithCreator = await Promise.all(
      posts.map(async (post) => {
        const creator = await ctx.db.get(post.creator);
        return { ...post, creator };
      })
    );

    return postsWithCreator;
  },
});

export const getInfinite = query({
  args: { cursor: v.optional(v.id("posts")), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let postsQuery = ctx.db.query("posts").order("desc");

    const posts = await postsQuery.take(limit + 1);

    // Filter posts after cursor if provided
    let filteredPosts = posts;
    if (args.cursor) {
      const cursorIndex = posts.findIndex((p) => p._id === args.cursor);
      if (cursorIndex !== -1) {
        filteredPosts = posts.slice(cursorIndex + 1);
      }
    }

    const hasMore = filteredPosts.length > limit;
    const resultPosts = filteredPosts.slice(0, limit);

    const postsWithCreator = await Promise.all(
      resultPosts.map(async (post) => {
        const creator = await ctx.db.get(post.creator);
        return { ...post, creator };
      })
    );

    return {
      documents: postsWithCreator,
      nextCursor: hasMore ? resultPosts[resultPosts.length - 1]._id : null,
    };
  },
});

export const getById = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;

    const creator = await ctx.db.get(post.creator);
    return { ...post, creator };
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const posts = await ctx.db.query("posts").order("desc").collect();

    // Filter posts by caption containing search term (case-insensitive)
    const filtered = posts.filter((post) =>
      post.caption.toLowerCase().includes(args.searchTerm.toLowerCase())
    );

    const postsWithCreator = await Promise.all(
      filtered.slice(0, 20).map(async (post) => {
        const creator = await ctx.db.get(post.creator);
        return { ...post, creator };
      })
    );

    return { documents: postsWithCreator };
  },
});

export const create = mutation({
  args: {
    creator: v.id("users"),
    caption: v.string(),
    imageUrl: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    location: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert("posts", {
      creator: args.creator,
      caption: args.caption,
      imageUrl: args.imageUrl,
      imageStorageId: args.imageStorageId,
      location: args.location ?? "",
      tags: args.tags,
      likes: [],
    });

    const post = await ctx.db.get(postId);
    const creator = await ctx.db.get(args.creator);
    return { ...post, creator };
  },
});

export const update = mutation({
  args: {
    postId: v.id("posts"),
    caption: v.string(),
    imageUrl: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    location: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { postId, ...updates } = args;
    await ctx.db.patch(postId, {
      caption: updates.caption,
      imageUrl: updates.imageUrl,
      imageStorageId: updates.imageStorageId,
      location: updates.location ?? "",
      tags: updates.tags,
    });

    const post = await ctx.db.get(postId);
    if (!post) return null;

    const creator = await ctx.db.get(post.creator);
    return { ...post, creator };
  },
});

export const remove = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    // Delete associated image from storage if exists
    if (post?.imageStorageId) {
      await ctx.storage.delete(post.imageStorageId);
    }

    // Delete all saves for this post
    const saves = await ctx.db
      .query("saves")
      .withIndex("by_post", (q) => q.eq("post", args.postId))
      .collect();

    for (const save of saves) {
      await ctx.db.delete(save._id);
    }

    await ctx.db.delete(args.postId);
    return { success: true };
  },
});

export const like = mutation({
  args: { postId: v.id("posts"), likes: v.array(v.id("users")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, { likes: args.likes });

    const post = await ctx.db.get(args.postId);
    if (!post) return null;

    const creator = await ctx.db.get(post.creator);
    return { ...post, creator };
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
