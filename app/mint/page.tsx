'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useWeb3 } from '@/components/web3-provider'
import { useToast } from '@/hooks/use-toast'
import { HeroGenerator, HeroAttributes, RARITY_CONFIG, FACTION_CONFIG } from '@/lib/hero-generator'
import { ContractService } from '@/lib/contracts'
import { useI18n } from '@/components/i18n-provider'
import { translateHeroName } from '@/lib/name-translator'
import { addMintTx } from '@/lib/tx-history' // NEW

interface MintingState {
  isApproving: boolean
  isMinting: boolean
  progress: number
  currentStep: string
  mintedHeroes: HeroAttributes[]
  showResults: boolean
}

function rarityLabel(rarity: string, locale: string, t: (k:string)=>string) {
  if (locale === 'zh') return RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.name || rarity
  return t(`rarity.${rarity}`)
}
function displayHeroName(hero: { tokenId?: number; id: string; name: string }, locale: string, t: (k:string)=>string) {
  if (locale === 'zh') return hero.name
  const base = hero.name || `${t('common.hero')} #${hero.tokenId ?? hero.id.slice(-4)}`
  const translated = translateHeroName(base, 'en')
  return translated || base
}
function factionLabel(fid: string, locale: string, t: (k:string)=>string) {
  if (locale === 'zh') return FACTION_CONFIG[fid as keyof typeof FACTION_CONFIG]?.name || fid
  if (fid === 'mechanical-empire') return t('factions.names.mechanical')
  if (fid === 'astral-conclave') return t('factions.names.astral')
  if (fid === 'void-reavers') return t('factions.names.void')
  return fid
}

export default function MintPage() {
  const { stgPrice, isConnected, stgBalance, account, provider } = useWeb3()
  const { toast } = useToast()
  const { t, locale } = useI18n()

  const [mintAmount, setMintAmount] = useState(1)
  const [mintingState, setMintingState] = useState<MintingState>({
    isApproving: false,
    isMinting: false,
    progress: 0,
    currentStep: '',
    mintedHeroes: [],
    showResults: false
  })
  const [contractService, setContractService] = useState<ContractService | null>(null)
  const [selectedHero, setSelectedHero] = useState<HeroAttributes | null>(null)
  const [mintHistory, setMintHistory] = useState<HeroAttributes[]>([])
  const [crystalEnergy, setCrystalEnergy] = useState(100)
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [showCinematic, setShowCinematic] = useState(false)
  const [needsUserPlay, setNeedsUserPlay] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const mintCostUSDT = 20
  const mintCostSTG = mintCostUSDT / stgPrice
  const totalCost = mintCostSTG * mintAmount

  const galleryNames = t('mint.galleryNames.mechanical.common1') // just to ensure key exists
  const nftGallery = [
    {
      faction: 'mechanical-empire',
      factionName: locale === 'zh' ? '机械帝国' : t('factions.names.mechanical'),
      heroes: [
        { rarity: 'common', name: t('mint.galleryNames.mechanical.common1'), image: '/nft/mechanical-empire-common-1.png' },
        { rarity: 'rare', name: t('mint.galleryNames.mechanical.rare1'), image: '/nft/mechanical-empire-rare-1.png' },
        { rarity: 'epic', name: t('mint.galleryNames.mechanical.epic1'), image: '/nft/mechanical-empire-epic-1.png' },
        { rarity: 'legendary', name: t('mint.galleryNames.mechanical.legendary1'), image: '/nft/mechanical-empire-legendary-1.png' }
      ]
    },
    {
      faction: 'astral-conclave',
      factionName: locale === 'zh' ? '星灵议会' : t('factions.names.astral'),
      heroes: [
        { rarity: 'common', name: t('mint.galleryNames.astral.common1'), image: '/nft/astral-conclave-common-1.png' },
        { rarity: 'rare', name: t('mint.galleryNames.astral.rare1'), image: '/nft/astral-conclave-rare-1.png' },
        { rarity: 'epic', name: t('mint.galleryNames.astral.epic1'), image: '/nft/astral-conclave-epic-1.png' },
        { rarity: 'legendary', name: t('mint.galleryNames.astral.legendary1'), image: '/nft/astral-conclave-legendary-1.png' }
      ]
    },
    {
      faction: 'void-reavers',
      factionName: locale === 'zh' ? '虚空掠夺者' : t('factions.names.void'),
      heroes: [
        { rarity: 'common', name: t('mint.galleryNames.void.common1'), image: '/nft/void-reavers-common-1.png' },
        { rarity: 'rare', name: t('mint.galleryNames.void.rare1'), image: '/nft/void-reavers-rare-1.png' },
        { rarity: 'epic', name: t('mint.galleryNames.void.epic1'), image: '/nft/void-reavers-epic-1.png' },
        { rarity: 'legendary', name: t('mint.galleryNames.void.legendary1'), image: '/nft/void-reavers-legendary-1.png' }
      ]
    }
  ]

  useEffect(() => {
    if (provider && isConnected) {
      setContractService(new ContractService(provider))
    }
  }, [provider, isConnected])

  useEffect(() => {
    const saved = localStorage.getItem('mintHistory')
    if (saved) setMintHistory(JSON.parse(saved))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCrystalEnergy(prev => {
        const v = prev + (Math.random() - 0.5) * 10
        return Math.max(80, Math.min(100, v))
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPreviewIndex(prev => (prev + 1) % nftGallery.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [nftGallery.length])

  useEffect(() => {
    if (showCinematic && videoRef.current) {
      try {
        videoRef.current.currentTime = 0
        videoRef.current.muted = false
      } catch {}
      videoRef.current.play().then(() => setNeedsUserPlay(false)).catch(() => setNeedsUserPlay(true))
    }
  }, [showCinematic])

  const saveMintHistory = (heroes: HeroAttributes[]) => {
    const newHistory = [...heroes, ...mintHistory].slice(0, 50)
    setMintHistory(newHistory)
    localStorage.setItem('mintHistory', JSON.stringify(newHistory))
  }

  const handleMint = async () => {
    if (!isConnected || !contractService || !account) {
      toast({ title: t('web3.notLinked'), variant: 'destructive' })
      return
    }
    if (parseFloat(stgBalance) < totalCost) {
      toast({ title: 'Insufficient STG', variant: 'destructive' })
      return
    }

    setMintingState(prev => ({ ...prev, isApproving: true, currentStep: 'Approving...', progress: 10 }))

    try {
      const allowance = await contractService.checkSTGAllowance(account)
      const requiredAmount = BigInt(Math.floor(totalCost * 1e18))
      if (allowance < requiredAmount) {
        setMintingState(prev => ({ ...prev, currentStep: 'Granting allowance...', progress: 20 }))
        const approved = await contractService.approveSTG(requiredAmount)
        if (!approved) throw new Error('Approval failed')
      }

      setMintingState(prev => ({ ...prev, isApproving: false, isMinting: true, currentStep: 'Minting...', progress: 40 }))
      const heroes = HeroGenerator.generateMultipleHeroes(mintAmount)

      const steps = ['Gathering stardust...', 'Infusing energy...', 'Activating matrix...', 'Shaping form...', 'Awakening...']
      for (let i = 0; i < mintAmount; i++) {
        for (let j = 0; j < steps.length; j++) {
          setMintingState(prev => ({ ...prev, currentStep: `Hero ${i + 1}/${mintAmount}: ${steps[j]}`, progress: 40 + ((i * steps.length + j) / (mintAmount * steps.length)) * 50 }))
          await new Promise(resolve => setTimeout(resolve, 800))
        }
      }

      const result = mintAmount === 1 ? await contractService.mintHero(heroes[0]) : await contractService.batchMintHeroes(mintAmount)
      if (result.success) {
        if (result.tokenId) heroes[0].tokenId = result.tokenId
        else if (result.tokenIds) heroes.forEach((h, idx) => (h.tokenId = result.tokenIds![idx]))

        setMintingState(prev => ({ ...prev, isMinting: false, progress: 100, currentStep: 'Done', mintedHeroes: heroes, showResults: false }))
        saveMintHistory(heroes)

        // NEW: record a mint transaction so Wallet can show real history
        const tokenIds = heroes.map(h => h.tokenId!).filter(Boolean) as number[]
        addMintTx({ totalCostSTG: totalCost, tokenIds, txHash: (result as any).txHash })

        setShowCinematic(true)
        toast({ title: t('web3.mintSuccess') })
      } else {
        throw new Error(result.error || 'Mint failed')
      }
    } catch (e: any) {
      setMintingState(prev => ({ ...prev, isApproving: false, isMinting: false, progress: 0, currentStep: '' }))
      toast({ title: 'Mint failed', description: e?.message, variant: 'destructive' })
    }
  }

  const resetMinting = () => setMintingState({ isApproving: false, isMinting: false, progress: 0, currentStep: '', mintedHeroes: [], showResults: false })
  const isProcessing = mintingState.isApproving || mintingState.isMinting

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/backgrounds/galactic-tech-grid.png')] opacity-30"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('mint.title')}
              </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-xl rounded-full"></div>
            </div>
            <p className="text-xl text-gray-300 mb-6 max-w-3xl mx-auto">{t('mint.lore')}</p>

            {/* Energy */}
            <Card className="max-w-md mx-auto bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border-cyan-500/30">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-300 font-medium">{t('mint.energy')}</span>
                  <span className="text-white font-bold">{crystalEnergy.toFixed(1)}%</span>
                </div>
                <Progress value={crystalEnergy} className="h-2 bg-slate-800">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-1000 animate-pulse"></div>
                </Progress>
                <p className="text-xs text-gray-400 mt-2">{t('mint.energyStable')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          {mintingState.showResults && (
            <Card className="mb-8 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 animate-pulse"></div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-yellow-300">
                  <span>{t('mint.resultsTitle')}</span>
                  <Button variant="ghost" size="sm" onClick={resetMinting} className="text-gray-400 hover:text-white">×</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {mintingState.mintedHeroes.map((hero, index) => (
                    <Card key={hero.id} className={`cursor-pointer transition-all duration-500 hover:scale-105 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-2 ${RARITY_CONFIG[hero.rarity]?.glow} hover:shadow-2xl`} onClick={() => setSelectedHero(hero)}>
                      <CardContent className="p-4">
                        <div className="relative mb-3">
                          <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-900/60">
                            <img src={hero.image || "/placeholder.svg"} alt={displayHeroName(hero, locale, t)} className="w-full h-full object-contain" />
                          </div>
                          <Badge className={`absolute top-2 right-2 ${RARITY_CONFIG[hero.rarity]?.color} text-white`}>{rarityLabel(hero.rarity, locale, t)}</Badge>
                        </div>
                        <h3 className="font-bold text-white text-sm mb-2">{displayHeroName(hero, locale, t)}</h3>
                        <div className="flex justify-between items-center text-xs"><span className="text-gray-400">{/* class hidden in EN if Chinese */}</span><span className="text-yellow-400">{hero.power}</span></div>
                        {hero.tokenId && <p className="text-xs text-purple-400 mt-1">NFT #{hero.tokenId}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Console */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-slate-900/50 to-purple-900/50 border-purple-500/30 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
                <CardHeader><CardTitle className="text-purple-300 relative z-10">{t('mint.randomTitle')}</CardTitle></CardHeader>
                <CardContent className="space-y-6 relative z-10">
                  {isProcessing && (
                    <Card className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border-cyan-500/30">
                      <CardContent className="py-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between"><span className="text-sm text-cyan-300 animate-pulse">{mintingState.currentStep}</span><span className="text-sm text-purple-400">{mintingState.progress}%</span></div>
                          <Progress value={mintingState.progress} className="h-3"><div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500 animate-pulse"></div></Progress>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {!isProcessing && (
                    <>
                      <Card className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border-indigo-500/30">
                        <CardContent className="py-4">
                          <h3 className="text-indigo-300 font-medium">{t('mint.randomTitle')}</h3>
                          <p className="text-gray-400 text-sm">{t('mint.randomDesc')}</p>
                        </CardContent>
                      </Card>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">{t('mint.qtyLabel')}</label>
                        <div className="flex items-center space-x-4">
                          <Input type="number" min="1" max="10" value={mintAmount} onChange={(e) => setMintAmount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))} className="bg-slate-800/50 border-purple-500/30 text-white backdrop-blur-sm" />
                          <div className="flex space-x-2">
                            {[1, 5, 10].map(amount => (
                              <Button key={amount} variant={mintAmount === amount ? 'default' : 'outline'} size="sm" onClick={() => setMintAmount(amount)} className="min-w-[3rem]">{amount}</Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Card className="bg-gradient-to-r from-slate-800/30 to-purple-800/30 border-purple-500/20 backdrop-blur-sm">
                        <CardHeader className="pb-3"><CardTitle className="text-sm text-purple-300">{t('mint.costTitle')}</CardTitle></CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between"><span className="text-gray-300">{t('mint.baseEnergy')}:</span><span className="text-cyan-400">20 USDT</span></div>
                              <div className="flex justify-between"><span className="text-gray-300">{t('mint.rate')}:</span><span className="text-cyan-400">${stgPrice.toFixed(8)}</span></div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between"><span className="text-gray-300">{t('mint.unitCost')}:</span><span className="text-purple-300">{mintCostSTG.toFixed(2)} STG</span></div>
                              <div className="flex justify-between"><span className="text-gray-300">{t('mint.qty')}:</span><span className="text-white">{mintAmount}</span></div>
                            </div>
                          </div>
                          <div className="border-t border-purple-500/20 mt-4 pt-4">
                            <div className="flex justify-between items-center text-lg font-bold">
                              <span className="text-white">{t('mint.total')}:</span>
                              <span className="text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">{totalCost.toFixed(2)} STG</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  <Button onClick={handleMint} disabled={!isConnected || isProcessing || parseFloat(stgBalance) < totalCost} className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-lg py-4 font-bold relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-cyan-400/20 animate-pulse"></div>
                    <div className="relative z-10">{isProcessing ? mintingState.currentStep : t('mint.startMint', { count: mintAmount })}</div>
                  </Button>

                  {!isConnected && (
                    <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
                      <CardContent className="py-4 text-center">
                        <p className="text-yellow-400 text-sm">{t('mint.notConnected')}</p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar: gallery preview */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-900/50 to-purple-900/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader><CardTitle className="text-purple-300">{t('mint.galleryTitle')}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 mb-3">{t('mint.allRandom')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {nftGallery[currentPreviewIndex].heroes.map((h, i) => (
                      <div key={i} className="bg-slate-800/40 rounded-md p-2">
                        <div className="aspect-[3/4] bg-slate-900/60 rounded overflow-hidden">
                          <img src={h.image || "/placeholder.svg"} alt={h.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="mt-1 text-xs text-white truncate">{h.name}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {mintHistory.length > 0 && (
                <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 backdrop-blur-sm">
                  <CardHeader><CardTitle className="text-green-300">{t('mint.recently')}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mintHistory.slice(0, 3).map((hero) => (
                        <div key={hero.id} className="flex items-center space-x-3 p-2 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors group" onClick={() => setSelectedHero(hero)}>
                          <img src={hero.image || "/placeholder.svg"} alt={displayHeroName(hero, locale, t)} className="w-10 h-12 object-contain rounded group-hover:scale-105 transition-transform" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate group-hover:text-green-300 transition-colors">{displayHeroName(hero, locale, t)}</p>
                            <div className="flex items-center space-x-2">
                              <Badge className={`${RARITY_CONFIG[hero.rarity]?.color} text-xs`}>{rarityLabel(hero.rarity, locale, t)}</Badge>
                              <span className="text-xs text-gray-400">{hero.power}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Modal */}
          {selectedHero && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/50 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-purple-300">{displayHeroName(selectedHero, locale, t)}</span>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedHero(null)} className="text-gray-400 hover:text-white">×</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <img src={selectedHero.image || "/placeholder.svg"} alt={displayHeroName(selectedHero, locale, t)} className="w-full h-64 object-contain rounded-lg border-2 border-purple-500/30" />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{t('mint.modal.basic')}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-gray-300">{t('mint.modal.faction')}:</span><span className="text-white">{factionLabel(selectedHero.faction, locale, t)}</span></div>
                          <div className="flex justify-between"><span className="text-gray-300">{t('mint.modal.class')}:</span><span className="text-white">{locale === 'zh' ? selectedHero.class : 'Class'}</span></div>
                          <div className="flex justify-between"><span className="text-gray-300">{t('mint.modal.rarity')}:</span><Badge className={RARITY_CONFIG[selectedHero.rarity]?.color}>{rarityLabel(selectedHero.rarity, locale, t)}</Badge></div>
                          {selectedHero.tokenId && <div className="flex justify-between"><span className="text-gray-300">{t('mint.modal.token')}:</span><span className="text-purple-400">#{selectedHero.tokenId}</span></div>}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{t('mint.modal.stats')}</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-800/50 p-2 rounded text-center"><div className="text-red-400"><span className="font-bold">{selectedHero.attack}</span></div><p className="text-xs text-gray-400">{t('mint.modal.attack')}</p></div>
                          <div className="bg-slate-800/50 p-2 rounded text-center"><div className="text-green-400"><span className="font-bold">{selectedHero.health}</span></div><p className="text-xs text-gray-400">{t('mint.modal.health')}</p></div>
                          <div className="bg-slate-800/50 p-2 rounded text-center"><div className="text-blue-400"><span className="font-bold">{selectedHero.defense}</span></div><p className="text-xs text-gray-400">{t('mint.modal.defense')}</p></div>
                          <div className="bg-slate-800/50 p-2 rounded text-center"><div className="text-yellow-400"><span className="font-bold">{selectedHero.speed}</span></div><p className="text-xs text-gray-400">{t('mint.modal.speed')}</p></div>
                        </div>
                        <div className="mt-3 bg-gradient-to-r from-purple-800/50 to-pink-800/50 p-3 rounded text-center border border-purple-500/30">
                          <div className="text-purple-400"><span className="text-xl font-bold">{selectedHero.power}</span></div>
                          <p className="text-sm text-gray-400">{t('mint.modal.power')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">{t('mint.modal.skills')}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedHero.abilities.map((ability, index) => (
                        <div key={index} className="bg-gradient-to-r from-slate-800/30 to-purple-800/30 p-2 rounded text-center border border-purple-500/20">
                          <span className="text-sm text-purple-300">{locale === 'zh' ? ability : 'Skill'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{t('mint.modal.lore')}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{locale === 'zh' ? selectedHero.description : 'A hero forged in the Soulforge, destined to leave a mark on the galaxy.'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {showCinematic && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-5xl mx-auto px-4">
            <video
              ref={videoRef}
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4b9f8dd83bd28c1f7335424c62a4a079_raw-YPZdalXzbxaBWLgZ752UQ6ggOxwBts.mp4"
              className="w-full h-auto rounded-lg shadow-2xl outline-none"
              playsInline
              preload="auto"
              autoPlay
              onEnded={() => { setShowCinematic(false); setMintingState(prev => ({ ...prev, showResults: true })) }}
              onError={() => { setShowCinematic(false); setMintingState(prev => ({ ...prev, showResults: true })) }}
            />
            {needsUserPlay && (
              <div className="mt-4 flex flex-col items-center space-y-2">
                <button className="px-6 py-2 rounded-md bg-white/10 text-white hover:bg-white/20 transition" onClick={async () => { try { await videoRef.current?.play(); setNeedsUserPlay(false) } catch {} }}>
                  Play Cinematic Video (with sound)
                </button>
                <p className="text-gray-400 text-sm">Some browsers block autoplay with sound. Tap to play.</p>
              </div>
            )}
            <p className="text-center text-gray-400 text-sm mt-3">Showing your forged heroes after the video.</p>
          </div>
        </div>
      )}
    </div>
  )
}
