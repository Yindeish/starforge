import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Web3Provider } from '@/components/web3-provider'
import { Navigation } from '@/components/navigation'
import { Toaster } from '@/components/ui/toaster'
import { I18nProvider } from '@/components/i18n-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StarForge: Hero Ascendancy',
  description: 'BSC Web3 Game - Mint, Battle, Stake and conquer the stars',
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <I18nProvider>
          <Web3Provider>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
              <div className="absolute inset-0 bg-[url('/backgrounds/galactic-tech-grid.png')] opacity-20"></div>
              <Navigation />
              <main className="relative z-10">{children}</main>
              <Toaster />
            </div>
          </Web3Provider>
        </I18nProvider>
      </body>
    </html>
  )
}
