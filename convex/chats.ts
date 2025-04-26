import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const list = query({
  handler: async (ctx) => {
    // Optional: Add user authentication here
    // const identity = await ctx.auth.getUserIdentity();
    // const userId = identity?.tokenIdentifier;
    // if (!userId) return [];
    
    // For now, list all chats without user filtering
    const chats = await ctx.db
      .query("chats")
      .order("desc")
      .collect();
      
    return chats;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    // Optional: Add user authentication here
    // const identity = await ctx.auth.getUserIdentity();
    // const userId = identity?.tokenIdentifier;
    
    const now = Date.now();
    
    const chatId = await ctx.db.insert("chats", {
      title: args.title,
      // userId: userId,
      createdAt: now,
      updatedAt: now,
    });
    
    return chatId;
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first();
      
    if (!chat) {
      return null;
    }
    
    // Get chat messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.id))
      .order("asc")
      .collect();
      
    return {
      ...chat,
      messages,
    };
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    // Optional: Add user authentication here
    // const identity = await ctx.auth.getUserIdentity();
    // const userId = identity?.tokenIdentifier;
    
    const chat = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first();
      
    if (!chat) {
      throw new Error("Chat not found");
    }
    
    // Check if the user owns the chat (if authentication is implemented)
    // if (chat.userId !== userId) {
    //   throw new Error("Unauthorized");
    // }
    
    // Delete the chat
    await ctx.db.delete(chat._id);
    
    // Delete all messages associated with this chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.id))
      .collect();
      
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    
    return chat._id;
  },
}); 