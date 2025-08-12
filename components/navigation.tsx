'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/brand-logo'
import { useWeb3 } from '@/components/web3-provider'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'
import { useI18n } from '@/components/i18n-provider'
import { X } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()
  const { account, connectWallet, disconnectWallet, isConnected, isConnecting, stgBalance, error } = useWeb3()
  const { toast } = useToast()
  const { t, locale, setLocale } = useI18n()

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/mint', label: t('nav.mint') },
    { href: '/battle', label: t('nav.battle') },
    { href: '/staking', label: t('nav.staking') },
    { href: '/factions', label: t('nav.factions') },
    { href: '/nft-gallery', label: t('nav.gallery') },
    { href: '/wallet', label: t('nav.wallet') },
  ]

  useEffect(() => {
    if (error) {
      toast({ title: t('nav.connect'), description: error, variant: 'destructive' })
    }
  }, [error, toast, t])

  const handleWalletAction = async () => {
    if (isConnected) disconnectWallet()
    else await connectWallet()
  }

  return (
    <nav className="relative z-20 border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <BrandLogo variant="fusion" size="md" showText={true} />
            </Link>
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-purple-600/20 text-purple-300'
                      : 'text-gray-300 hover:text-white hover:bg-purple-600/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language switcher */}
            <div className="flex items-center rounded-md border border-purple-500/30 overflow-hidden">
              <button
                onClick={() => setLocale('en')}
                className={`px-3 py-1 text-sm ${locale === 'en' ? 'bg-purple-600/30 text-white' : 'text-gray-300 hover:text-white'}`}
                aria-pressed={locale === 'en'}
              >
                EN
              </button>
              <div className="w-px h-5 bg-purple-500/30" />
              <button
                onClick={() => setLocale('zh')}
                className={`px-3 py-1 text-sm ${locale === 'zh' ? 'bg-purple-600/30 text-white' : 'text-gray-300 hover:text-white'}`}
                aria-pressed={locale === 'zh'}
              >
                中文
              </button>
            </div>

            {/* STG balance */}
            {isConnected && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-300">
                <BrandLogo variant="fusion" size="sm" showText={false} />
                <span className="text-purple-400">{parseFloat(stgBalance).toLocaleString()}</span>
                <span>STG</span>
              </div>
            )}

            {/* Wallet button */}
            <Button
              onClick={handleWalletAction}
              disabled={isConnecting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isConnecting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t('nav.connecting')}</span>
                </div>
              ) : isConnected ? (
                <span>{account?.slice(0, 6)}...{account?.slice(-4)}</span>
              ) : (
                <span>{t('nav.connect')}</span>
              )}
            </Button>

            {/* X button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open('https://x.com/StarForge_bsc', '_blank')}
              className="border-purple-500/50 text-purple-300 hover:bg-purple-600/20"
              aria-label="Open X (Twitter)"
              title="Open X (Twitter)"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">X</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
