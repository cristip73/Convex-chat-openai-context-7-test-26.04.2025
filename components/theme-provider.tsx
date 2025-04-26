"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Folosim tipurile din modulul next-themes
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider(props: ThemeProviderProps) {
  return <NextThemesProvider {...props} />
} 