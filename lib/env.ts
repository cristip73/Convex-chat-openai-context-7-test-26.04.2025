export function getEnv(name: string): string {
  const value = process.env[name];
  
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  
  return value;
}

export function getOpenAIKey(): string {
  return getEnv("OPENAI_API_KEY");
} 