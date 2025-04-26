"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const MODEL_OPTIONS = [
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
  { value: "gpt-4.1", label: "GPT-4.1" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
  className?: string;
}

export function ModelSelector({ value, onChange, className }: ModelSelectorProps) {
  return (
    <select
      data-slot="model-selector"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "border-input dark:bg-input/30 bg-background h-9 rounded-md border px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        className
      )}
    >
      {MODEL_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}