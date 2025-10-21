
'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
}

export function MainNav() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
    },
    {
      href: '/contract-analysis',
      label: 'Contract Analysis',
    },
    {
      href: '/argument-generation',
      label: 'Argument Generation',
    },
    {
      href: '/search',
      label: 'Legal Search',
    },
  ]

  const renderNavItem = ({ href, label }: NavItem) => {
    const isActive = pathname === href

    return (
      <Link href={href} key={href} className={cn(
        "text-base font-medium transition-colors hover:text-primary",
        isActive ? "text-primary" : "text-muted-foreground"
      )}>
        {label}
      </Link>
    )
  }

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {navItems.map((item) => (
        renderNavItem(item)
      ))}
    </nav>
  )
}
