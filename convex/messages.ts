import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const list = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId_createdAt", (q) => 
        q.eq("chatId", args.chatId)
      )
      .order("asc")
      .collect();
      
    return messages;
  },
});

// Adaug o nouă funcție pentru a căuta după rol
export const getByRole = query({
  args: { 
    chatId: v.string(),
    role: v.string() 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("role"), args.role))
      .collect();
  },
});

export const send = mutation({
  args: {
    chatId: v.string(),
    content: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // Optional: Add user authentication here
    // const identity = await ctx.auth.getUserIdentity();
    // const userId = identity?.tokenIdentifier;
    
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content,
      role: args.role,
      createdAt: Date.now(),
      // userId: userId,
    });
    
    // Update the chat's updatedAt timestamp
    const chat = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("_id"), args.chatId))
      .first();
      
    if (chat) {
      await ctx.db.patch(chat._id, {
        updatedAt: Date.now(),
      });
    }
    
    return messageId;
  },
}); 