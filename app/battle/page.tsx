'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import { useI18n } from '@/components/i18n-provider'

export default function BattlePage() {
const { t } = useI18n()

return (
  <div className="container mx-auto px-4 py-12">
    <div className="max-w-3xl mx-auto">
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900/60 to-purple-900/60 border-purple-500/30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
        <CardHeader className="relative z-10 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-purple-600/20 flex items-center justify-center">
            <Lock className="w-7 h-7 text-purple-300" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            {t('battle.unavailable.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 text-center space-y-6">
          <p className="text-gray-300">
            {t('battle.unavailable.desc')}
          </p>
          <Button
            disabled
            className="bg-gradient-to-r from-gray-700 to-gray-600 cursor-not-allowed"
            aria-disabled="true"
          >
            {t('battle.buttons.soon')}
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
)
}
