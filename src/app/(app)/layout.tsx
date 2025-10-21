'use client'

import * as React from 'react'
import Link from 'next/link'
import { useIsClient } from 'usehooks-ts'

import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import { MainNav } from '@/components/main-nav'
import { UserNav } from '@/components/user-nav'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient()

  if (!isClient) {
    return null
  }

  return (
    <TooltipProvider>
      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Icons.logo className="h-6 w-6" />
              <span className="font-bold">NyayaGPT</span>
            </Link>
            <MainNav />
          </div>

          <div className="flex items-center gap-4">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </TooltipProvider>
  )
}
