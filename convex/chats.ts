import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * List all chats (no user filtering yet).
 */
export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_updatedAt")
      .order("desc")
      .collect();
  },
});

/**
 * List chats filtered by model.
 */
export const listByModel = query({
  args: { model: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_model", (q) => q.eq("model", args.model))
      .order("desc")
      .collect();
  },
});

/**
 * List chats for a specific user, ordered by most recent activity.
 */
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_userId_updatedAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

/**
 * Create a new chat.
 */
export const create = mutation({
  args: {
    title: v.string(),
    model: v.string(), // e.g. "gpt-4.1-mini"
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const chatId = await ctx.db.insert("chats", {
      title: args.title,
      model: args.model,
      createdAt: now,
      updatedAt: now,
    });
    return chatId;
  },
});

/**
 * Fetch a chat together with its messages.
 */
export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first();
    if (!chat) return null;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId_createdAt", (q) => q.eq("chatId", args.id))
      .order("asc")
      .collect();

    // Conversia obiectelor pentru a fi compatibile cu tipul Message din app
    const formattedMessages = messages.map(message => ({
      id: message._id,
      content: message.content,
      role: message.role, // Acum este compatibil cu tipul "user" | "assistant" | "system"
      createdAt: message.createdAt
    }));

    return { 
      ...chat, 
      messages: formattedMessages 
    };
  },
});

/**
 * Change the model for an existing chat.
 */
export const setModel = mutation({
  args: { id: v.string(), model: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id as Id<"chats">, {
      model: args.model,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

/**
 * Remove a chat and all its messages.
 */
export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first();
    if (!chat) throw new Error("Chat not found");

    await ctx.db.delete(chat._id);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.id))
      .collect();
    for (const msg of messages) await ctx.db.delete(msg._id);

    return chat._id;
  },
}); 