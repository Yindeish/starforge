'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/components/i18n-provider'

export default function FactionsPage() {
  const { t, locale } = useI18n()

  const factions = [
    {
      id: 'mechanical-empire',
      name: locale === 'zh' ? t('factions.names.mechanical') : t('factions.names.mechanical'),
      description: locale === 'zh' ? t('factions.desc.mechanical') : t('factions.desc.mechanical'),
      image: '/mechanical-empire.png',
      philosophy: locale === 'zh' ? t('factions.philosophy.mechanical') : t('factions.philosophy.mechanical'),
      strength: locale === 'zh' ? t('factions.strength.mechanical') : t('factions.strength.mechanical'),
      members: '12,847'
    },
    {
      id: 'astral-conclave',
      name: locale === 'zh' ? t('factions.names.astral') : t('factions.names.astral'),
      description: locale === 'zh' ? t('factions.desc.astral') : t('factions.desc.astral'),
      image: '/astral-conclave-headquarters.png',
      philosophy: locale === 'zh' ? t('factions.philosophy.astral') : t('factions.philosophy.astral'),
      strength: locale === 'zh' ? t('factions.strength.astral') : t('factions.strength.astral'),
      members: '11,203'
    },
    {
      id: 'void-reavers',
      name: locale === 'zh' ? t('factions.names.void') : t('factions.names.void'),
      description: locale === 'zh' ? t('factions.desc.void') : t('factions.desc.void'),
      image: '/void-reavers-stronghold.png',
      philosophy: locale === 'zh' ? t('factions.philosophy.void') : t('factions.philosophy.void'),
      strength: locale === 'zh' ? t('factions.strength.void') : t('factions.strength.void'),
      members: '9,876'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Title and status */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('factions.title')}
            </h1>
            <div className="absolute -top-2 -right-8">
              <Badge className="bg-gradient-to-r from-gray-500 to-gray-600">{t('factions.badge')}</Badge>
            </div>
          </div>
          <p className="text-gray-300 text-lg mb-6">{t('factions.description')}</p>
        </div>

        {/* Development notice */}
        <Card className="mb-8 bg-gradient-to-r from-slate-900/50 to-purple-900/50 border-purple-500/30">
          <CardHeader><CardTitle className="text-purple-300 text-center">{t('factions.devTitle')}</CardTitle></CardHeader>
          <CardContent><p className="text-gray-300 text-center">{t('factions.devBody')}</p></CardContent>
        </Card>

        {/* Faction preview */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {factions.map((faction) => (
            <Card key={faction.id} className="relative overflow-hidden bg-gradient-to-br from-slate-900/50 to-purple-900/50 border border-purple-500/20 hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center"><p className="text-gray-200 font-medium">{t('factions.previewLocked')}</p></div>
              </div>

              <CardHeader className="pb-3">
                <img src={faction.image || '/placeholder.svg'} alt={faction.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                <CardTitle className="text-xl text-white">{faction.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm">{faction.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center"><span className="text-gray-400">Members</span><span className="text-white">{faction.members}</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-400">Philosophy</span><span className="text-purple-300">{faction.philosophy}</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-400">Strength</span><span className="text-green-300">{faction.strength}</span></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Teaser */}
        <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-500/30">
          <CardHeader><CardTitle className="text-red-300">{t('factions.teaserTitle')}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">The Final Showdown of Three Factions</h3>
              <p className="text-gray-300 leading-relaxed max-w-4xl mx-auto">{t('factions.teaserBody')}</p>
            </div>
            <div className="text-center">
              <button disabled className="bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed text-white text-lg px-8 py-3 rounded-md">
                {t('factions.buttonSoon')}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Preparation */}
        <Card className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardHeader><CardTitle className="text-blue-300">{t('factions.prepTitle')}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-white mb-3">{t('factions.prepHeroes.title')}</h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <p>{t('factions.prepHeroes.a')}</p>
                  <p>{t('factions.prepHeroes.b')}</p>
                  <p>{t('factions.prepHeroes.c')}</p>
                  <p>{t('factions.prepHeroes.d')}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-white mb-3">{t('factions.prepResources.title')}</h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <p>{t('factions.prepResources.a')}</p>
                  <p>{t('factions.prepResources.b')}</p>
                  <p>{t('factions.prepResources.c')}</p>
                  <p>{t('factions.prepResources.d')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
