'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FileText,
  Gavel,
  LayoutDashboard,
  Search,
  Settings,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

export function MainNav({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="size-5" />,
    },
    {
      href: '/contract-analysis',
      label: 'Contract Analysis',
      icon: <FileText className="size-5" />,
    },
    {
      href: '/argument-generation',
      label: 'Argument Generation',
      icon: <Gavel className="size-5" />,
    },
    {
      href: '/search',
      label: 'Legal Search',
      icon: <Search className="size-5" />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="size-5" />,
    },
  ]

  const renderNavItem = ({ href, label, icon }: NavItem) => {
    const isActive = pathname === href

    if (isCollapsed) {
      return (
        <Tooltip key={href}>
          <TooltipTrigger asChild>
            <Link href={href}>
              <SidebarMenuButton
                variant={isActive ? 'default' : 'ghost'}
                className="size-12"
                aria-label={label}
              >
                {icon}
              </SidebarMenuButton>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            {label}
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <Link href={href} key={href}>
        <SidebarMenuButton
          variant={isActive ? 'default' : 'ghost'}
          className={cn('w-full justify-start', isActive && "bg-sidebar-accent text-sidebar-accent-foreground")}
        >
          <span className="shrink-0">{icon}</span>
          <span className="truncate">{label}</span>
        </SidebarMenuButton>
      </Link>
    )
  }

  return (
    <nav className="flex flex-col gap-2 px-2">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            {renderNavItem(item)}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  )
}
