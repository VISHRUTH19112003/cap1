import Link from 'next/link'

import { Icons } from '@/components/icons'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col items-center">
        <Link href="/" className="mb-8 flex items-center gap-2 text-2xl font-bold">
          <Icons.logo className="h-7 w-7" />
          <h1>NyayaGPT</h1>
        </Link>
        {children}
      </div>
    </main>
  )
}
