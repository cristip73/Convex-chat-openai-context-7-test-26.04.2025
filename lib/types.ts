export interface Message {
  id?: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt?: number;
}

export interface Chat {
  id?: string;
  title: string;
  model?: string;
  messages?: Message[];
  userId?: string;
  createdAt?: number;
  updatedAt?: number;
} 