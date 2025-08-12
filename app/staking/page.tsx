'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWeb3 } from '@/components/web3-provider'
import { useToast } from '@/hooks/use-toast'
import { StakingService, StakedHero, StakingStats } from '@/lib/staking-service'
import { HeroAttributes, RARITY_CONFIG } from '@/lib/hero-generator'
import { useI18n } from '@/components/i18n-provider'
import { translateHeroName } from '@/lib/name-translator'

function rarityLabel(rarity: string, locale: string, t: (k: string)=>string) {
  if (locale === 'zh') return RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.name || rarity
  return t(`rarity.${rarity}`)
}

function displayHeroName(hero: { tokenId?: number; id: string; name: string }, locale: string, t: (k:string)=>string) {
  if (locale === 'zh') return hero.name
  const base = hero.name || `${t('common.hero')} #${hero.tokenId ?? hero.id.slice(-4)}`
  const translated = translateHeroName(base, 'en')
  return translated || base
}

export default function StakingPage() {
  const { isConnected } = useWeb3()
  const { toast } = useToast()
  const { t, locale } = useI18n()

  const [stakedHeroes, setStakedHeroes] = useState<StakedHero[]>([])
  const [availableHeroes, setAvailableHeroes] = useState<HeroAttributes[]>([])
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([])
  const [stakingStats, setStakingStats] = useState<StakingStats>({
    totalStaked: 0,
    totalDailyRewards: 0,
    totalLifetimeEarnings: 0,
    averageAPY: 0
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentEarnings, setCurrentEarnings] = useState<Record<string, number>>({})

  useEffect(() => {
    loadStakingData()
    const interval = setInterval(loadStakingData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadStakingData = () => {
    const staked = StakingService.getStakedHeroes()
    const available = StakingService.getAvailableHeroes()
    const stats = StakingService.getStakingStats()

    setStakedHeroes(staked)
    setAvailableHeroes(available)
    setStakingStats(stats)

    const earnings: Record<string, number> = {}
    staked.forEach(hero => {
      earnings[hero.id] = StakingService.calculateCurrentEarnings(hero)
    })
    setCurrentEarnings(earnings)
  }

  const handleStakeHeroes = async () => {
    if (!isConnected) {
      toast({ title: t('staking.connectFirst'), variant: 'destructive' })
      return
    }
    if (selectedHeroes.length === 0) {
      toast({ title: t('staking.availableTitle'), variant: 'destructive' })
      return
    }

    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const heroesToStake = availableHeroes.filter(hero => selectedHeroes.includes(hero.id))
      heroesToStake.forEach(hero => StakingService.stakeHero(hero))
      setSelectedHeroes([])
      loadStakingData()
      toast({ title: t('staking.title'), description: 'OK' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnstakeHero = async (heroId: string) => {
    if (!isConnected) {
      toast({ title: t('staking.connectFirst'), variant: 'destructive' })
      return
    }
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const result = StakingService.unstakeHero(heroId)
      loadStakingData()
      toast({ title: t('staking.unstake'), description: `${result.earnings} STG` })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClaimAllRewards = async () => {
    if (!isConnected) {
      toast({ title: t('staking.connectFirst'), variant: 'destructive' })
      return
    }
    if (stakedHeroes.length === 0) {
      toast({ title: t('staking.currentTitle'), variant: 'destructive' })
      return
    }
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const totalRewards = StakingService.claimAllRewards()
      loadStakingData()
      toast({ title: t('staking.pending.title'), description: `${totalRewards.toLocaleString()} STG` })
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleHeroSelection = (heroId: string) => {
    setSelectedHeroes(prev => prev.includes(heroId) ? prev.filter(id => id !== heroId) : [...prev, heroId])
  }

  const getRarityColor = (rarity: string) => {
    const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common
    return config.color
  }

  const getStakedDays = (stakedAt: number) => {
    const days = Math.floor((Date.now() - stakedAt) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  const totalPendingRewards = Object.values(currentEarnings).reduce((sum, earning) => sum + earning, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            {t('staking.title')}
          </h1>
          <p className="text-gray-300 text-lg">{t('staking.subtitle')}</p>
        </div>

        {/* Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30">
            <CardHeader className="pb-3"><CardTitle className="text-green-300">{t('staking.overview.staked')}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-white">{stakingStats.totalStaked}</div></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
            <CardHeader className="pb-3"><CardTitle className="text-blue-300">{t('staking.overview.daily')}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-white">{stakingStats.totalDailyRewards.toLocaleString()}</div></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
            <CardHeader className="pb-3"><CardTitle className="text-purple-300">{t('staking.overview.apy')}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-white">{stakingStats.averageAPY.toFixed(1)}%</div></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/30">
            <CardHeader className="pb-3"><CardTitle className="text-yellow-300">{t('staking.overview.lifetime')}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-white">{stakingStats.totalLifetimeEarnings.toLocaleString()}</div></CardContent>
          </Card>
        </div>

        {/* Pending */}
        {totalPendingRewards > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-yellow-300">
                <span>{t('staking.pending.title')}</span>
                <Button onClick={handleClaimAllRewards} disabled={isProcessing} className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                  {isProcessing ? t('staking.pending.title') : t('staking.pending.claim', { amount: totalPendingRewards.toLocaleString() })}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold text-yellow-400">{totalPendingRewards.toLocaleString()} STG</div>
                <div className="text-gray-300"><p className="text-sm">{t('staking.pending.liveNote')}</p></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Staked heroes */}
        {stakedHeroes.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30">
            <CardHeader><CardTitle className="text-green-300">{t('staking.currentTitle')}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stakedHeroes.map((hero) => (
                  <Card key={hero.id} className="bg-slate-800/50 border border-green-500/20 hover:border-green-500/40 transition-colors">
                    <CardContent className="p-4">
                      <div className="relative mb-3">
                        <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-900/60">
                          <img src={hero.image || "/placeholder.svg"} alt={displayHeroName(hero, locale, t)} className="absolute inset-0 w-full h-full object-contain" />
                          <Badge className={`absolute top-2 right-2 ${getRarityColor(hero.rarity)} text-white text-xs`}>
                            {rarityLabel(hero.rarity, locale, t)}
                          </Badge>
                        </div>
                      </div>
                      <h3 className="font-medium text-white text-sm mb-2 truncate">{displayHeroName(hero, locale, t)}</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center"><span className="text-gray-400">{t('staking.power')}:</span><span className="text-yellow-400">{hero.power}</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-400">{t('staking.dailyReward')}:</span><span className="text-green-400 font-bold">{hero.dailyReward.toLocaleString()} STG</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-400">{t('staking.daysStaked')}:</span><span className="text-blue-400">{getStakedDays(hero.stakedAt)}</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-400">{t('staking.pending.title')}:</span><span className="text-yellow-400 font-bold">{currentEarnings[hero.id]?.toLocaleString() || 0} STG</span></div>
                      </div>
                      <Button onClick={() => handleUnstakeHero(hero.id)} disabled={isProcessing} variant="outline" size="sm" className="w-full mt-3 border-red-500/50 text-red-400 hover:bg-red-600/20">
                        {t('staking.unstake')}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available heroes */}
        <Card className="bg-gradient-to-r from-slate-900/50 to-purple-900/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-purple-300">{t('staking.availableTitle')}</span>
              {selectedHeroes.length > 0 && (
                <Button onClick={handleStakeHeroes} disabled={isProcessing || !isConnected} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  {t('staking.selectAndStake', { count: selectedHeroes.length })}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="text-center py-12"><p className="text-gray-400 text-lg">{t('staking.connectFirst')}</p></div>
            ) : availableHeroes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableHeroes.map((hero) => {
                  const isSelected = selectedHeroes.includes(hero.id)
                  const dailyReward = StakingService.calculateDailyReward(hero)
                  const apy = StakingService.estimateHeroAPY(hero)
                  return (
                    <Card key={hero.id} className={`cursor-pointer transition-all duration-300 ${isSelected ? 'border-purple-500 bg-purple-900/20 scale-105' : 'border-gray-600 hover:border-purple-500/50 bg-slate-800/50'}`} onClick={() => toggleHeroSelection(hero.id)}>
                      <CardContent className="p-4">
                        <div className="relative mb-3">
                          <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-900/60">
                            <img src={hero.image || "/placeholder.svg"} alt={displayHeroName(hero, locale, t)} className="absolute inset-0 w-full h-full object-contain" />
                            <Badge className={`absolute top-2 right-2 ${getRarityColor(hero.rarity)} text-white text-xs`}>{rarityLabel(hero.rarity, locale, t)}</Badge>
                            {isSelected && <div className="absolute inset-0 bg-purple-500/20 rounded-lg" />}
                          </div>
                        </div>
                        <h3 className="font-medium text-white text-sm mb-2 truncate">{displayHeroName(hero, locale, t)}</h3>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center"><span className="text-gray-400">{t('staking.power')}:</span><span className="text-yellow-400">{hero.power}</span></div>
                          <div className="flex justify-between items-center"><span className="text-gray-400">{t('staking.dailyReward')}:</span><span className="text-green-400 font-bold">{dailyReward.toLocaleString()} STG/{t('common.day')}</span></div>
                          <div className="flex justify-between items-center"><span className="text-gray-400">APY:</span><span className="text-purple-400">{apy.toFixed(1)}%</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">{t('staking.noneAvailable')}</p>
                <p className="text-gray-500">{t('staking.mintOrUnstake')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-blue-300">{t('staking.infoTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-white mb-3">{t('staking.baseRatesTitle')}</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  {(['common','rare','epic','legendary','mythic'] as const).map((r) => {
                    const daily = StakingService.getDailyRewardRate(r) * 100
                    const apy = daily * 365
                    const name = rarityLabel(r, locale, t)
                    return (<li key={r}>• {name}: ~{daily.toFixed(0)}% / day, ~{apy.toFixed(0)}% / year</li>)
                  })}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-3">{t('staking.notesTitle')}</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• {t('staking.noteA')}</li>
                  <li>• {t('staking.noteB')}</li>
                  <li>• {t('staking.noteC')}</li>
                  <li>• {t('staking.noteD')}</li>
                  <li>• {t('staking.noteE')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
