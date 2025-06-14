# CristiGPT Clone

A responsive ChatGPT-like application built with Next.js, Convex, and Vercel AI SDK.

## Features

- Real-time chat with GPT-4 model
- Streaming responses
- Responsive UI based on Tailwind CSS
- Dark mode support
- Conversations saved to Convex database
- Markdown support in messages
- Multi-model support: OpenAI GPT, Anthropic Claude, Google Gemini 2.5 Flash

## Technologies Used

- [Next.js](https://nextjs.org/) - React Framework
- [Convex](https://convex.dev/) - Backend and Database
- [Vercel AI SDK](https://sdk.vercel.ai/docs) - LLM Integration
- [OpenAI GPT-4](https://openai.com/) - AI Model
- [Anthropic Claude](https://anthropic.com/) - AI Model
- [Google Gemini 2.5 Flash](https://ai.google.dev/) - AI Model
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [React](https://reactjs.org/) - UI Library

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local` and add your API keys:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `ANTHROPIC_API_KEY` - Your Anthropic API key  
   - `GOOGLE_GENERATIVE_AI_API_KEY` - Your Google AI API key
   - `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL
4. Run the Convex development server: `npx convex dev`
5. Run the Next.js development server: `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js pages and routes
- `/components` - React components
- `/convex` - Convex backend code
- `/lib` - Utility functions and types
- `/public` - Static assets

## Configuration

To use this application, you need to:

1. Create a Convex account at [convex.dev](https://convex.dev)
2. Get an OpenAI API key at [platform.openai.com](https://platform.openai.com)
3. Get an Anthropic API key at [console.anthropic.com](https://console.anthropic.com)
4. Get a Google AI API key at [aistudio.google.com](https://aistudio.google.com)
5. Update your `.env.local` file with the required API keys

## License

This project is open source and available under the [MIT License](LICENSE).

---

## 📋 Complete Project Analysis & Documentation

### 🎯 Project Purpose & Scope

**CristiGPT Clone** is a sophisticated ChatGPT-style conversational AI application featuring the personality of **Mooji**, a beloved spiritual teacher and sage. The application provides spiritual guidance, wisdom, and gentle humor through AI-powered conversations, built with enterprise-grade technologies and modern development practices.

### 🛠️ Complete Technology Stack

#### **Frontend Technologies**
- **Next.js 15.3.1** - React framework with App Router
- **React 19.0.0** - Latest React version with concurrent features
- **TypeScript 5** - Strict type safety and modern JS features
- **Tailwind CSS 4** - Utility-first CSS framework with custom theming
- **Geist Fonts** - Modern typography (Sans & Mono variants)

#### **Backend & Database**
- **Convex 1.23.0** - Real-time database with serverless functions
- **Edge Runtime** - Optimized for streaming responses
- **Convex Schema** - Type-safe database operations with indexing

#### **AI & LLM Integration**
- **Vercel AI SDK 4.3.10** - Unified AI integration layer
- **OpenAI GPT Models** - GPT-4.1, GPT-4.1-mini, GPT-4o, GPT-4o-mini, GPT-3.5-turbo
- **Anthropic Claude** - Claude Sonnet 4 (20250514)
- **Google Gemini** - Gemini 2.5 Flash (preview-05-20)
- **Streaming Responses** - Real-time AI response streaming

#### **UI Components & Libraries**
- **Radix UI** - Accessible component primitives
  - `@radix-ui/react-checkbox`
  - `@radix-ui/react-label` 
  - `@radix-ui/react-slot`
- **NextUI 2.6.11** - Modern React component library
- **Lucide React 0.503.0** - Beautiful icon library
- **React Markdown 10.1.0** - Markdown rendering in messages
- **Sonner 2.0.3** - Toast notifications system

#### **Form & State Management**
- **React Hook Form 7.56.1** - Performant form handling
- **Zod 3.24.3** - Runtime type validation
- **@hookform/resolvers 5.0.1** - Form validation integration

#### **Styling & Theming**
- **next-themes 0.4.6** - Dark/light theme switching
- **class-variance-authority 0.7.1** - Component variant system
- **clsx 2.1.1** - Conditional className utility
- **tailwind-merge 3.2.0** - Tailwind class merging
- **tw-animate-css 1.2.8** - CSS animations

#### **Development Tools**
- **ESLint 9** - Code linting with Next.js configuration
- **PostCSS** - CSS processing and optimization
- **nanoid 5.1.5** - Unique ID generation

### 🏗️ Project Architecture

#### **File Structure Overview**
```
├── app/                          # Next.js App Router
│   ├── (routes)/                 # Route groups
│   │   └── chat/                 # Chat interface routes
│   ├── api/                      # API endpoints
│   └── globals.css               # Global styles & themes
├── components/                   # Reusable React components
│   ├── ui/                       # Base UI components
│   └── chat-*.tsx               # Chat-specific components
├── convex/                       # Convex backend
│   ├── _generated/              # Auto-generated types
│   ├── schema.ts                # Database schema
│   ├── chats.ts                 # Chat operations
│   └── messages.ts              # Message operations
├── lib/                         # Utility functions
└── public/                      # Static assets
```

#### **Database Schema Design**
```typescript
// Messages Table
messages: {
  chatId: string,              // Foreign key to chats
  content: string,             // Message content
  role: "user" | "assistant" | "system",
  createdAt: number,           // Timestamp
  userId?: string              // Optional user tracking
}

// Chats Table  
chats: {
  title: string,               // Chat conversation title
  model?: string,              // AI model used
  userId?: string,             // Optional user tracking
  createdAt: number,           // Creation timestamp
  updatedAt: number            // Last activity timestamp
}
```

#### **Component Architecture**
- **ChatShell** - Main container managing state and routing
- **ChatSidebar** - Navigation with conversation history
- **Chat** - Core chat interface with message handling
- **ChatInput** - Message input with form validation
- **ChatMessage** - Individual message rendering with markdown
- **ModelSelector** - AI model switching interface
- **ThemeProvider** - Dark/light mode management

### 🚀 Key Features & Capabilities

#### **AI Conversation Features**
- **Multi-Model Support** - Switch between OpenAI GPT, Anthropic Claude, and Google Gemini models
- **Streaming Responses** - Real-time AI response generation
- **Mooji Personality** - Spiritual teacher persona with wisdom and humor
- **Context Awareness** - Maintains conversation context across messages
- **Temperature Control** - Optimized response creativity (0.7)
- **Token Limits** - Up to 6000 tokens per response

#### **User Interface Features**
- **Responsive Design** - Mobile-first approach with adaptive layouts
- **Dark/Light Themes** - Automatic and manual theme switching
- **Markdown Support** - Rich text rendering in messages
- **Message History** - Persistent conversation storage
- **Sidebar Navigation** - Collapsible chat history with search
- **Loading States** - Elegant loading indicators during AI responses
- **Toast Notifications** - User feedback for actions

#### **Performance Optimizations**
- **Edge Runtime** - Faster response times for API routes
- **Database Indexing** - Optimized queries with Convex indexes
- **Component Memoization** - React optimization patterns
- **Lazy Loading** - Efficient resource loading
- **Streaming Architecture** - Progressive content delivery

#### **Accessibility Features**
- **Screen Reader Support** - ARIA labels and semantic HTML
- **Keyboard Navigation** - Full keyboard accessibility
- **High Contrast** - Theme-aware color schemes
- **Focus Management** - Proper focus handling

### 🎨 Design System

#### **Color Scheme**
- **Light Theme** - Clean white backgrounds with subtle grays
- **Dark Theme** - Rich dark backgrounds with high contrast
- **Brand Colors** - Professional blue/purple accent colors
- **Semantic Colors** - Consistent success, warning, error states

#### **Typography**
- **Primary Font** - Geist Sans (modern, readable)
- **Monospace Font** - Geist Mono (code and technical content)
- **Font Scales** - Responsive typography with proper hierarchy

#### **Component Variants**
- **Consistent Sizing** - sm, md, lg, xl size variants
- **Interactive States** - Hover, focus, active, disabled states
- **Animation System** - Smooth transitions and micro-interactions

### 🔧 Development & Deployment

#### **Development Workflow**
1. **Local Development** - `npm run dev` with hot reloading
2. **Database Development** - `npx convex dev` for real-time backend
3. **Type Safety** - Strict TypeScript with generated types
4. **Code Quality** - ESLint with Next.js best practices
5. **Component Development** - Modular, reusable components

#### **Environment Configuration**
- **OpenAI API Key** - Required for GPT model access
- **Anthropic API Key** - Required for Claude model access
- **Google AI API Key** - Required for Gemini model access
- **Convex Configuration** - Database and serverless functions
- **Environment Variables** - Secure API key management

#### **Build & Production**
- **Static Generation** - Optimized builds with Next.js
- **Edge Deployment** - Serverless functions with global distribution
- **Performance Monitoring** - Core Web Vitals optimization

### 📊 Technical Specifications

#### **Performance Metrics**
- **Bundle Size** - Optimized with tree shaking and code splitting
- **Loading Speed** - Edge runtime for sub-100ms API responses
- **Database Performance** - Indexed queries for instant data retrieval
- **Memory Usage** - Efficient React patterns and cleanup

#### **Security Considerations**
- **API Key Security** - Environment variable protection
- **Input Validation** - Zod schema validation on all inputs
- **XSS Protection** - Secure markdown rendering
- **Rate Limiting** - Planned implementation for production

#### **Scalability Features**
- **Real-time Architecture** - Convex handles concurrent users
- **Serverless Functions** - Auto-scaling backend operations
- **Database Indexing** - Optimized for large conversation volumes
- **CDN Integration** - Global content delivery optimization

### 🎯 Advanced Implementation Details

#### **AI System Prompt**
The application implements a sophisticated system prompt that transforms any AI model into Mooji's personality:
- **Spiritual Guidance** - Advaita Vedanta and non-dual awareness
- **Compassionate Communication** - Gentle, loving guidance
- **Authentic Voice** - Direct experience rather than intellectual knowledge
- **Teaching Style** - Simple wisdom that dissolves mental complexity

#### **Real-time Data Flow**
1. **User Input** - Captured via React Hook Form with validation
2. **Message Storage** - Immediately saved to Convex database
3. **AI Processing** - Streamed to AI provider with context
4. **Response Streaming** - Real-time UI updates during generation
5. **Message Persistence** - Complete conversation saved automatically

#### **State Management Strategy**
- **Server State** - Convex queries for real-time data synchronization
- **Client State** - React state for UI interactions and forms
- **Optimistic Updates** - Immediate UI feedback before server confirmation
- **Error Handling** - Graceful degradation with user notifications

This comprehensive documentation reflects the sophisticated architecture and thoughtful implementation of CristiGPT Clone, showcasing modern web development practices and enterprise-grade feature implementation.
