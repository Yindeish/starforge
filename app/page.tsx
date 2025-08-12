"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrandLogo } from "@/components/brand-logo"
import { useWeb3 } from "@/components/web3-provider"
import { useI18n } from "@/components/i18n-provider"

export default function HomePage() {
  const { stgPrice } = useWeb3()
  const { t } = useI18n()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="relative">
          <div className="mb-8">
            <BrandLogo variant="fusion" size="xl" showText={false} className="justify-center" />
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t("home.title")}
          </h1>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">{t("home.subtitle")}</p>

        {/* Price */}
        <Card className="max-w-md mx-auto mb-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-center space-x-2 text-purple-300">
              <BrandLogo variant="fusion" size="sm" showText={false} />
              <span>{t("home.priceTitle")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center text-white">${stgPrice.toFixed(2)} USDT</div>
            <p className="text-sm text-gray-400 text-center mt-2">{t("home.priceNote")}</p>
          </CardContent>
        </Card>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/mint">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3">
              {t("home.ctaMint")}
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-purple-500 text-purple-300 hover:bg-purple-600/20 text-lg px-8 py-3 bg-transparent"
            onClick={() =>
              window.open("https://four.meme/zh-TW/token/0x6ab88be9d02bfeb0896cd0bce419d4caf5124444", "_blank")
            }
          >
            {t("home.ctaBuy")}
          </Button>
        </div>
      </div>

      {/* Features (fully localized) */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30 hover:border-blue-400/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-blue-300">{t("home.features.mint.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">{t("home.features.mint.desc")}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/30 hover:border-red-400/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-red-300">{t("home.features.battles.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">{t("home.features.battles.desc")}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 hover:border-green-400/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-green-300">{t("home.features.staking.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">{t("home.features.staking.desc")}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 hover:border-purple-400/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-purple-300">{t("home.features.factions.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">{t("home.features.factions.desc")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lore (fully localized) */}
      <Card className="bg-gradient-to-r from-slate-900/50 to-purple-900/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-purple-300">{t("home.loreTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-300 text-lg leading-relaxed max-w-4xl mx-auto">{t("home.loreBody")}</p>
        </CardContent>
      </Card>
    </div>
  )
}
