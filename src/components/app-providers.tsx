"use client"

import { FirebaseClientProvider } from "@/firebase/client-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="nyayagpt-theme"
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </FirebaseClientProvider>
  )
}
