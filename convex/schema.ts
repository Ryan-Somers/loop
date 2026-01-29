import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    username: v.string(),
    imageUrl: v.string(),
    bio: v.optional(v.string()),
    passwordHash: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  posts: defineTable({
    creator: v.id("users"),
    caption: v.string(),
    imageUrl: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    location: v.optional(v.string()),
    tags: v.array(v.string()),
    likes: v.array(v.id("users")),
  })
    .index("by_creator", ["creator"]),

  saves: defineTable({
    user: v.id("users"),
    post: v.id("posts"),
  })
    .index("by_user", ["user"])
    .index("by_post", ["post"])
    .index("by_user_and_post", ["user", "post"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),
});
