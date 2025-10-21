
import Link from 'next/link'
import { ArrowRight, FileText, Gavel, Search, Settings } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const features = [
  {
    title: 'Contract Analysis',
    description: 'Upload or paste contract text to get an AI-powered summary, risk analysis, and suggested revisions.',
    href: '/contract-analysis',
    icon: <FileText className="mb-4 h-8 w-8 text-accent" />,
  },
  {
    title: 'Argument Generation',
    description: 'Provide a legal prompt and generate structured arguments citing relevant Indian legal authorities.',
    href: '/argument-generation',
    icon: <Gavel className="mb-4 h-8 w-8 text-accent" />,
  },
  {
    title: 'Legal Search',
    description: 'Use natural language to search Indian legal precedents, cases and statutes.',
    href: '/search',
    icon: <Search className="mb-4 h-8 w-8 text-accent" />,
  },
  {
    title: 'Settings',
    description: 'Manage your account and application settings.',
    href: '/settings',
    icon: <Settings className="mb-4 h-8 w-8 text-accent" />,
  }
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Welcome to NyayaGPT</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your AI-powered legal assistant for Indian Law.
        </p>
      </div>
      
      <Separator />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.href} className="group">
            <Card className="flex h-full flex-col transition-all group-hover:shadow-lg group-hover:-translate-y-1">
              <CardHeader>
                {feature.icon}
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex items-center text-sm font-semibold text-primary">
                Get Started <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
