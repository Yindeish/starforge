'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/components/i18n-provider'
import { RARITY_CONFIG } from '@/lib/hero-generator'
import { translateHeroName, translateAbility } from '@/lib/name-translator'

interface NFTCardProps {
  id: string
  name: string
  faction: 'mechanical-empire' | 'astral-conclave' | 'void-reavers'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  power: number
  health: number
  attack: number
  image: string
  description?: string
  abilities?: string[]
  viewMode?: 'grid' | 'list'
}

export function NFTCard({
  id,
  name,
  faction,
  rarity,
  power,
  health,
  attack,
  image,
  description,
  abilities = [],
  viewMode = 'grid',
}: NFTCardProps) {
  const { t, locale } = useI18n()
  const isList = viewMode === 'list'

  const getFactionInfo = (f: string) => {
    switch (f) {
      case 'mechanical-empire':
        return {
          name: locale === 'zh' ? t('factions.names.mechanical') : t('factions.names.mechanical'),
          color: 'from-blue-600 to-cyan-600',
          borderColor: 'border-blue-500/50',
        }
      case 'astral-conclave':
        return {
          name: locale === 'zh' ? t('factions.names.astral') : t('factions.names.astral'),
          color: 'from-purple-600 to-pink-600',
          borderColor: 'border-purple-500/50',
        }
      case 'void-reavers':
        return {
          name: locale === 'zh' ? t('factions.names.void') : t('factions.names.void'),
          color: 'from-red-600 to-orange-600',
          borderColor: 'border-red-500/50',
        }
      default:
        return {
          name: 'Unknown',
          color: 'from-gray-600 to-gray-700',
          borderColor: 'border-gray-500/50',
        }
    }
  }

  const rarityName = locale === 'zh'
    ? (RARITY_CONFIG[rarity]?.name || rarity)
    : t(`rarity.${rarity}`)

  const factionInfo = getFactionInfo(faction)
  const rarityColor = RARITY_CONFIG[rarity]?.color || 'bg-gray-500'
  const rarityGlow = RARITY_CONFIG[rarity]?.glow || 'shadow-gray-500/20'

  const displayName =
    locale === 'zh'
      ? name
      : (translateHeroName(name, 'en') || name || `${t('common.hero')} #${id}`)

  const displayAbilities =
    locale === 'zh' ? abilities : (abilities || []).map(a => translateAbility(a, 'en'))

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-800/80 ${factionInfo.borderColor} border-2 hover:scale-105 transition-all duration-300 ${rarityGlow} shadow-xl`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${factionInfo.color} opacity-10`}></div>

      <div className="absolute top-2 right-2 z-10">
        <Badge className={`${rarityColor} text-white font-bold`}>{rarityName}</Badge>
      </div>

      <div className="absolute top-2 left-2 z-10">
        <Badge variant="outline" className={`${factionInfo.borderColor} text-white`}>{factionInfo.name}</Badge>
      </div>

      <CardContent className="p-0">
        <div className={`relative ${isList ? 'h-56 md:h-64' : 'h-80'} overflow-hidden bg-slate-900/60`}>
          <img
            src={image || "/placeholder.svg"}
            alt={displayName}
            className={`w-full h-full ${isList ? 'object-contain p-2' : 'object-cover'}`}
          />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900 to-transparent"></div>
        </div>

        <div className="p-4 space-y-3">
          <h3 className="text-xl font-bold text-white text-center">{displayName}</h3>

          {description && (
            <p className="text-sm text-gray-300 text-center">
              {locale === 'zh' ? description : ''}
            </p>
          )}

          <div className={`grid ${isList ? 'grid-cols-3' : 'grid-cols-3'} gap-2 text-center`}>
            <div className="bg-slate-800/50 rounded-lg p-2">
              <div className="text-red-400">
                <span className="text-sm font-bold">{attack}</span>
              </div>
              <p className="text-xs text-gray-400">{t('gallery.card.attack')}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2">
              <div className="text-green-400">
                <span className="text-sm font-bold">{health}</span>
              </div>
              <p className="text-xs text-gray-400">{t('gallery.card.health')}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2">
              <div className="text-yellow-400">
                <span className="text-sm font-bold">{power}</span>
              </div>
              <p className="text-xs text-gray-400">{t('gallery.card.power')}</p>
            </div>
          </div>

          {displayAbilities.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-gray-300">{t('gallery.card.abilities')}</h4>
              {displayAbilities.map((ability, index) => (
                <p key={index} className="text-xs text-gray-300/90 bg-slate-800/30 rounded px-2 py-1">
                  {ability}
                </p>
              ))}
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500">NFT #{id}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
