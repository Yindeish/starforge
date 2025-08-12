'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NFTCard } from '@/components/nft-card'
import { Filter, Grid, List } from 'lucide-react'
import { useI18n } from '@/components/i18n-provider'

export default function NFTGalleryPage() {
  const { t, locale } = useI18n()
  const [selectedFaction, setSelectedFaction] = useState<string>('all')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Keep canonical CN abilities; translate at render time for EN
  const nftCollection = useMemo(() => ([
    {
      id: '001',
      name: locale === 'zh' ? '机械战士 Alpha' : 'Mech Warrior Alpha',
      faction: 'mechanical-empire' as const,
      rarity: 'common' as const,
      power: 420,
      health: 100,
      attack: 85,
      image: '/nft/mechanical-empire-common-1.png',
      description: locale === 'zh' ? '机械帝国的基础战士，装备标准激光武器' : '',
      abilities: ['激光射击', '护盾充能']
    },
    {
      id: '002',
      name: locale === 'zh' ? '赛博武士 Beta' : 'Cyber Samurai Beta',
      faction: 'mechanical-empire' as const,
      rarity: 'rare' as const,
      power: 650,
      health: 120,
      attack: 110,
      image: '/nft/mechanical-empire-rare-1.png',
      description: locale === 'zh' ? '进阶赛博战士，拥有等离子剑和全息界面' : '',
      abilities: ['等离子斩击', '战术分析', '能量护盾']
    },
    {
      id: '003',
      name: locale === 'zh' ? '机械指挥官 Gamma' : 'Mech Commander Gamma',
      faction: 'mechanical-empire' as const,
      rarity: 'epic' as const,
      power: 850,
      health: 150,
      attack: 140,
      image: '/nft/mechanical-empire-epic-1.png',
      description: locale === 'zh' ? '机械帝国的精英指挥官，装备双能量炮' : '',
      abilities: ['双重轰击', '纳米翅膀', '全息指挥', '电磁脉冲']
    },
    {
      id: '004',
      name: locale === 'zh' ? '赛博霸主 Omega' : 'Cyber Overlord Omega',
      faction: 'mechanical-empire' as const,
      rarity: 'legendary' as const,
      power: 1200,
      health: 200,
      attack: 180,
      image: '/nft/mechanical-empire-legendary-1.png',
      description: locale === 'zh' ? '机械帝国的最高统治者，掌控无尽科技力量' : '',
      abilities: ['能量巨锤', '浮空无人机', '全息护盾', '量子传送', '领域控制']
    },
    {
      id: '005',
      name: locale === 'zh' ? '星光法师 Alpha' : 'Starlight Mage Alpha',
      faction: 'astral-conclave' as const,
      rarity: 'common' as const,
      power: 380,
      health: 90,
      attack: 95,
      image: '/nft/astral-conclave-common-1.png',
      description: locale === 'zh' ? '星灵议会的初级法师，掌握基础星光魔法' : '',
      abilities: ['星光弹', '冥想回复']
    },
    {
      id: '006',
      name: locale === 'zh' ? '星辰术士 Beta' : 'Celestial Warlock Beta',
      faction: 'astral-conclave' as const,
      rarity: 'rare' as const,
      power: 580,
      health: 110,
      attack: 125,
      image: '/nft/astral-conclave-rare-1.png',
      description: locale === 'zh' ? '精通水晶魔法，能操控宇宙能量' : '',
      abilities: ['水晶爆发', '星云护盾', '能量汲取']
    },
    {
      id: '007',
      name: locale === 'zh' ? '天体祭司 Gamma' : 'Astral Priest Gamma',
      faction: 'astral-conclave' as const,
      rarity: 'epic' as const,
      power: 780,
      health: 140,
      attack: 155,
      image: '/nft/astral-conclave-epic-1.png',
      description: locale === 'zh' ? '天体祭司，能够召唤行星之力' : '',
      abilities: ['星辉权杖', '行星轨道', '宇宙符文', '能量波动']
    },
    {
      id: '008',
      name: locale === 'zh' ? '宇宙君主 Omega' : 'Cosmic Sovereign Omega',
      faction: 'astral-conclave' as const,
      rarity: 'legendary' as const,
      power: 1150,
      health: 180,
      attack: 190,
      image: '/nft/astral-conclave-legendary-1.png',
      description: locale === 'zh' ? '宇宙的统治者，掌控星系的终极力量' : '',
      abilities: ['星辰之刃', '银河之翼', '宇宙爆发', '时空扭曲', '星云领域']
    },
    {
      id: '009',
      name: locale === 'zh' ? '虚空战士 Alpha' : 'Void Warrior Alpha',
      faction: 'void-reavers' as const,
      rarity: 'common' as const,
      power: 450,
      health: 110,
      attack: 75,
      image: '/nft/void-reavers-common-1.png',
      description: locale === 'zh' ? '虚空掠夺者的基础战士，擅长潜行和暗杀' : '',
      abilities: ['暗影刃', '虚空潜行']
    },
    {
      id: '010',
      name: locale === 'zh' ? '虚空刺客 Beta' : 'Void Assassin Beta',
      faction: 'void-reavers' as const,
      rarity: 'rare' as const,
      power: 620,
      health: 100,
      attack: 135,
      image: '/nft/void-reavers-rare-1.png',
      description: locale === 'zh' ? '精通暗杀术，拥有腐蚀触手' : '',
      abilities: ['双刃突袭', '腐蚀毒雾', '暗影步']
    },
    {
      id: '011',
      name: locale === 'zh' ? '虚空军阀 Gamma' : 'Void Warlord Gamma',
      faction: 'void-reavers' as const,
      rarity: 'epic' as const,
      power: 820,
      health: 160,
      attack: 145,
      image: '/nft/void-reavers-epic-1.png',
      description: locale === 'zh' ? '虚空军阀，掌控死亡镰刀和骨翼' : '',
      abilities: ['死亡镰刀', '骨翼飞行', '死灵能量', '虚空触手']
    },
    {
      id: '012',
      name: locale === 'zh' ? '虚空霸主 Omega' : 'Void Overlord Omega',
      faction: 'void-reavers' as const,
      rarity: 'legendary' as const,
      power: 1180,
      health: 190,
      attack: 175,
      image: '/nft/void-reavers-legendary-1.png',
      description: locale === 'zh' ? '终极统治者，带来毁灭与混沌' : '',
      abilities: ['虚空巨斧', '骷髅之翼', '死灵漩涡', '虚空裂隙', '混沌领域']
    }
  ]), [locale])

  const factions = [
    { id: 'all', name: t('gallery.allFactions') },
    { id: 'mechanical-empire', name: t('factions.names.mechanical') },
    { id: 'astral-conclave', name: t('factions.names.astral') },
    { id: 'void-reavers', name: t('factions.names.void') }
  ]

  const rarities = [
    { id: 'all', name: t('gallery.allRarities') },
    { id: 'common', name: t('rarity.common') },
    { id: 'rare', name: t('rarity.rare') },
    { id: 'epic', name: t('rarity.epic') },
    { id: 'legendary', name: t('rarity.legendary') }
  ]

  const filteredNFTs = nftCollection.filter(nft => {
    const factionMatch = selectedFaction === 'all' || nft.faction === selectedFaction
    const rarityMatch = selectedRarity === 'all' || nft.rarity === selectedRarity
    return factionMatch && rarityMatch
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t('gallery.title')}
          </h1>
          <p className="text-gray-300 text-lg">{t('gallery.subtitle')}</p>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-slate-900/50 to-purple-900/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-300">
              <Filter className="w-5 h-5" />
              <span>{t('gallery.filters')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('gallery.faction')}</label>
                <div className="flex flex-wrap gap-2">
                  {factions.map(faction => (
                    <Button
                      key={faction.id}
                      onClick={() => setSelectedFaction(faction.id)}
                      variant={selectedFaction === faction.id ? "default" : "outline"}
                      size="sm"
                    >
                      {faction.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('gallery.rarity')}</label>
                <div className="flex flex-wrap gap-2">
                  {rarities.map(rarity => (
                    <Button
                      key={rarity.id}
                      onClick={() => setSelectedRarity(rarity.id)}
                      variant={selectedRarity === rarity.id ? "default" : "outline"}
                      size="sm"
                    >
                      {rarity.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('gallery.view')}</label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setViewMode('grid')}
                    variant={viewMode === 'grid' ? "default" : "outline"}
                    size="sm"
                  >
                    <Grid className="w-4 h-4 mr-2" />
                    {t('gallery.grid')}
                  </Button>
                  <Button
                    onClick={() => setViewMode('list')}
                    variant={viewMode === 'list' ? "default" : "outline"}
                    size="sm"
                  >
                    <List className="w-4 h-4 mr-2" />
                    {t('gallery.list')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1 md:grid-cols-2'
        }`}>
          {filteredNFTs.map(nft => (
            <NFTCard key={nft.id} {...nft} viewMode={viewMode} />
          ))}
        </div>

        {filteredNFTs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">{t('gallery.empty')}</p>
            <Button
              onClick={() => {
                setSelectedFaction('all')
                setSelectedRarity('all')
              }}
              className="mt-4"
            >
              {t('gallery.reset')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
