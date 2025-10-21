'use client'

import * as React from 'react'
import Link from 'next/link'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useIsClient } from 'usehooks-ts'

import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import { MainNav } from '@/components/main-nav'
import { UserNav } from '@/components/user-nav'
import { Button } from '@/components/ui/button'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const isClient = useIsClient()

  if (!isClient) {
    return null
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="relative flex min-h-screen">
          <aside
            className={cn(
              'flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out',
              isCollapsed ? 'w-16' : 'w-64'
            )}
          >
            <div
              className={cn(
                'flex h-16 items-center border-b px-4',
                isCollapsed ? 'justify-center' : 'justify-between'
              )}
            >
              {!isCollapsed && (
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Icons.logo className="h-6 w-6" />
                  <span className="font-bold">NyayaGPT</span>
                </Link>
              )}
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <MainNav isCollapsed={isCollapsed} />
            </div>
          </aside>
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
              <div className="flex items-center gap-4">
                <UserNav />
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
