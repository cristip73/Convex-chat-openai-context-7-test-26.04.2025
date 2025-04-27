# CristiGPT Clone

A responsive ChatGPT-like application built with Next.js, Convex, and Vercel AI SDK.

## Features

- Real-time chat with GPT-4 model
- Streaming responses
- Responsive UI based on Tailwind CSS
- Dark mode support
- Conversations saved to Convex database
- Markdown support in messages

## Technologies Used

- [Next.js](https://nextjs.org/) - React Framework
- [Convex](https://convex.dev/) - Backend and Database
- [Vercel AI SDK](https://sdk.vercel.ai/docs) - LLM Integration
- [OpenAI GPT-4](https://openai.com/) - AI Model
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [React](https://reactjs.org/) - UI Library

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local` and add your OpenAI API key
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
3. Update your `.env.local` file with the required API keys

## License

This project is open source and available under the [MIT License](LICENSE).
