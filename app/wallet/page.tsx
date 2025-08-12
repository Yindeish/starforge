"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BrandLogo } from "@/components/brand-logo"
import { useWeb3 } from "@/components/web3-provider"
import { Wallet, ExternalLink, TrendingUp, Shield, Zap, AlertCircle, CheckCircle, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/components/i18n-provider"
import { type HeroAttributes, RARITY_CONFIG } from "@/lib/hero-generator"
import { StakingService } from "@/lib/staking-service"
import { getRecentTx, type TxEntry } from "@/lib/tx-history"
import { translateClassName, translateHeroName } from "@/lib/name-translator"

export default function WalletPage() {
  const { account, stgBalance, bnbBalance, isConnected, isConnecting, connectWallet, error } = useWeb3()
  const { toast } = useToast()
  const { t, locale } = useI18n()

  const [mintedHeroes, setMintedHeroes] = useState<HeroAttributes[]>([])
  const [recentTx, setRecentTx] = useState<TxEntry[]>([])

  useEffect(() => {
    if (!isConnected) return
    const saved = localStorage.getItem("mintHistory")
    const list: HeroAttributes[] = saved ? JSON.parse(saved) : []

    // Mark staked
    const staked = StakingService.getStakedHeroes()
    const stakedIds = new Set(staked.map((h) => h.id))
    const merged = list.map((h) => ({ ...h, isStaked: stakedIds.has(h.id) }) as any)

    setMintedHeroes(merged)
    setRecentTx(getRecentTx(10))
  }, [isConnected])

  const totalPower = useMemo(() => mintedHeroes.reduce((s, h) => s + (h.power || 0), 0), [mintedHeroes])

  const rarityLabel = (rarity: string) => {
    if (locale === "zh") return RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.name || rarity
    return t(`rarity.${rarity}`)
  }
  const rarityColor = (rarity: string) => RARITY_CONFIG[rarity]?.color || "bg-gray-500"

  // Build a standardized hero name:
  // - Prefer "Class #tokenId" if tokenId exists
  // - Otherwise fall back to stored name; for EN translate class
  const displayName = (hero: HeroAttributes) => {
    const serialFromName = (nm?: string) => {
      const m = (nm || "").match(/#(\d{1,})/)
      return m ? m[1] : hero.id.slice(-4)
    }

    const idPart = hero.tokenId ? String(hero.tokenId) : serialFromName(hero.name)
    if (locale === "zh") {
      const clsZh =
        hero.class && /[\u4e00-\u9fff]/.test(hero.class) ? hero.class : hero.name?.replace(/[#\s]\d+.*/, "") || "英雄"
      return `${clsZh} #${idPart}`
    }
    // EN
    const clsEn = translateClassName(hero.class || "", "en") || translateHeroName(hero.name || "", "en")
    const cleanCls = (clsEn || "Hero").replace(/\s+#\d+.*/, "")
    return `${cleanCls} #${idPart}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: t("wallet.copiedTitle"),
      description: t("wallet.copiedDesc"),
    })
  }

  const formatAgo = (ts: number) => {
    const diffMs = Date.now() - ts
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    if (hours < 24) return t("battle.history.hoursAgo", { hours })
    const days = Math.floor(hours / 24)
    return t("battle.history.daysAgo", { days })
  }

  // Not connected
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-slate-900/50 to-purple-900/50 border-purple-500/30">
            <CardContent className="py-12">
              <Wallet className="w-16 h-16 mx-auto text-gray-500 mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">{t("wallet.connectTitle")}</h2>
              <p className="text-gray-300 mb-6">{t("wallet.connectDesc")}</p>

              {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isConnecting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t("nav.connecting")}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4" />
                    <span>{t("wallet.connectBtn")}</span>
                  </div>
                )}
              </Button>

              <div className="mt-6 text-sm text-gray-400">
                <p>{t("wallet.supported")}</p>
                <div className="flex justify-center space-x-4 mt-2">
                  <span>{t("wallet.metaMask")}</span>
                  <span>•</span>
                  <span>{t("wallet.walletConnect")}</span>
                  <span>•</span>
                  <span>{t("wallet.trustWallet")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t("wallet.overviewTitle")}
          </h1>
          <p className="text-gray-300 text-lg">{t("wallet.manageDesc")}</p>
        </div>

        {/* Connected status */}
        <Card className="mb-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>{t("wallet.connectedBadge")}</span>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-blue-300">
                <BrandLogo variant="fusion" size="sm" showText={false} />
                <span>{t("wallet.stgBalance")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">{Number.parseFloat(stgBalance).toLocaleString()}</div>
              <p className="text-gray-400 text-sm">{t("wallet.testTokenNote")}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-yellow-300">
                <Zap className="w-5 h-5" />
                <span>{t("wallet.bnbBalance")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">{Number.parseFloat(bnbBalance).toFixed(4)}</div>
              <p className="text-gray-400 text-sm">{t("wallet.gasFeeNote")}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-purple-300">
                <Shield className="w-5 h-5" />
                <span>{t("wallet.nftHeroes")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">{mintedHeroes.length}</div>
              <p className="text-gray-400 text-sm">
                {t("wallet.stakedShort", { count: mintedHeroes.filter((h) => (h as any).isStaked).length })}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-green-300">
                <TrendingUp className="w-5 h-5" />
                <span>{t("wallet.totalPower")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">{totalPower}</div>
              <p className="text-gray-400 text-sm">{t("wallet.totalPowerDesc")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Address */}
        <Card className="mb-8 bg-gradient-to-r from-slate-900/50 to-purple-900/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-300">{t("wallet.addressTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg">
              <span className="text-white font-mono text-sm">{account}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(account || "")}
                className="border-purple-500/50 text-purple-300 hover:bg-purple-600/20"
              >
                <Copy className="w-4 h-4 mr-2" />
                {t("wallet.copy")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Heroes list (standardized names) and Recent Tx */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">{t("wallet.heroesTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              {mintedHeroes.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No NFTs yet. Mint your first hero on the Mint page.
                </div>
              ) : (
                <div className="space-y-4">
                  {mintedHeroes.map((hero) => (
                    <div key={hero.id} className="flex items-center space-x-4 p-3 bg-slate-800/30 rounded-lg">
                      <img
                        src={hero.image || "/placeholder.svg"}
                        alt={displayName(hero)}
                        className="w-16 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm truncate">{displayName(hero)}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={rarityColor(hero.rarity)}>{rarityLabel(hero.rarity)}</Badge>
                          {(hero as any).isStaked && (
                            <Badge variant="outline" className="text-green-400 border-green-400">
                              {t("wallet.stakedBadge")}
                            </Badge>
                          )}
                          {hero.tokenId && <span className="text-xs text-purple-300">#{hero.tokenId}</span>}
                        </div>
                        <div className="flex items-center space-x-1 mt-1 text-xs text-gray-400">
                          <Zap className="w-3 h-3" />
                          <span>{hero.power}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-300">{t("wallet.recentTx")}</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTx.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No transactions yet.</div>
              ) : (
                <div className="space-y-4">
                  {recentTx.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm">
                          {tx.type === "mint" ? t("wallet.tx.mint") : tx.type}
                          {tx.tokenIds && tx.tokenIds.length > 0 ? ` · #${tx.tokenIds.join(", #")}` : ""}
                        </p>
                        <p className="text-gray-400 text-xs">{formatAgo(tx.timestamp)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium text-sm ${tx.amountSTG >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {tx.amountSTG >= 0 ? "+" : ""}
                          {tx.amountSTG.toFixed(2)} STG
                        </p>
                        {tx.hash ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://bscscan.com/tx/${tx.hash}`, "_blank")}
                            className="text-xs text-gray-400 hover:text-white p-0 h-auto"
                          >
                            {`${tx.hash.slice(0, 10)}...`}
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions (remove PancakeSwap and OpenSea as requested) */}
        <Card className="mt-8 bg-gradient-to-r from-slate-900/50 to-purple-900/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-300">{t("wallet.quickActions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                onClick={() =>
                  window.open("https://four.meme/zh-TW/token/0x6ab88be9d02bfeb0896cd0bce419d4caf5124444", "_blank")
                }
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t("wallet.links.fourmeme")}
              </Button>
              <Button
                onClick={() => window.open(`https://bscscan.com/address/${account}`, "_blank")}
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-600/20"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t("wallet.links.bscscan")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
