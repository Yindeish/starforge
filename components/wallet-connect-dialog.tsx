'use client'

import * as React from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/components/i18n-provider'

export interface AnnouncedProviderInfo {
  rdns: string
  name: string
  icon: string // data URL from wallet
}

export interface WalletItem {
  info: AnnouncedProviderInfo
  provider: any
}

interface WalletConnectDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  wallets: WalletItem[]
  onSelect: (wallet: WalletItem) => void
}

export function WalletConnectDialog({
  open = false,
  onOpenChange,
  wallets,
  onSelect,
}: WalletConnectDialogProps) {
  const { t, locale } = useI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-purple-300">
            {locale === 'zh' ? '选择你的钱包' : 'Choose Your Wallet'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {locale === 'zh'
              ? '我们已检测到以下可用钱包。请选择要连接的钱包。'
              : 'We detected the following wallets. Select one to connect.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {wallets.length > 0 ? (
            wallets.map((w) => (
              <Button
                key={w.info.rdns}
                variant="outline"
                className="w-full justify-start gap-3 border-purple-500/40 hover:bg-purple-600/20"
                onClick={() => onSelect(w)}
              >
                {w.info.icon ? (
                  <Image
                    src={w.info.icon || "/placeholder.svg"}
                    alt={w.info.name}
                    width={24}
                    height={24}
                    className="rounded"
                  />
                ) : (
                  <div className="w-6 h-6 rounded bg-slate-700" />
                )}
                <span className="text-white">{w.info.name}</span>
                <span className="ml-auto text-xs text-gray-400">{w.info.rdns}</span>
              </Button>
            ))
          ) : (
            <div className="p-4 rounded-lg bg-slate-800/50 border border-purple-500/20">
              <p className="text-sm text-gray-300">
                {locale === 'zh'
                  ? '未检测到浏览器内置钱包。请在内置钱包浏览器中打开本站，或安装桌面钱包扩展。'
                  : 'No in-browser wallets detected. Open this site inside your wallet browser or install a desktop wallet extension.'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">
            {locale === 'zh' ? '常见钱包下载' : 'Popular wallets'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Button
              variant="ghost"
              className="justify-center text-gray-300 hover:text-white"
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
            >
              MetaMask
            </Button>
            <Button
              variant="ghost"
              className="justify-center text-gray-300 hover:text-white"
              onClick={() => window.open('https://rabby.io', '_blank')}
            >
              Rabby
            </Button>
            <Button
              variant="ghost"
              className="justify-center text-gray-300 hover:text-white"
              onClick={() => window.open('https://www.okx.com/download', '_blank')}
            >
              OKX Wallet
            </Button>
            <Button
              variant="ghost"
              className="justify-center text-gray-300 hover:text-white"
              onClick={() => window.open('https://web3.bitget.com/en/wallet-download', '_blank')}
            >
              Bitget Wallet
            </Button>
            <Button
              variant="ghost"
              className="justify-center text-gray-300 hover:text-white"
              onClick={() => window.open('https://trustwallet.com/download', '_blank')}
            >
              Trust Wallet
            </Button>
            <Button
              variant="ghost"
              className="justify-center text-gray-300 hover:text-white"
              onClick={() => window.open('https://coin98.com/wallet', '_blank')}
            >
              Coin98
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
