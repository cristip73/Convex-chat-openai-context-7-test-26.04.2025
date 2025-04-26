import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    chatId: v.string(),
    content: v.string(),
    role: v.string(),
    createdAt: v.number(),
    userId: v.optional(v.string()),
  })
    .index("by_chatId", ["chatId"])
    .index("by_chatId_createdAt", ["chatId", "createdAt"])
    .index("by_role", ["role"])
    .index("by_userId", ["userId"]),
  
  chats: defineTable({
    title: v.string(),
    model: v.optional(v.string()),
    userId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_updatedAt", ["updatedAt"])
    .index("by_model", ["model"])
    .index("by_userId_updatedAt", ["userId", "updatedAt"]),
}); 