import { HeroAttributes } from './hero-generator'

export interface StakedHero extends HeroAttributes {
  stakedAt: number
  dailyReward: number
  totalEarned: number
  isStaked: true
}

export interface StakingStats {
  totalStaked: number
  totalDailyRewards: number
  totalLifetimeEarnings: number
  averageAPY: number
}

export class StakingService {
  private static STORAGE_KEY = 'stakedHeroes'
  private static EARNINGS_KEY = 'stakingEarnings'

  // 名义铸造成本（与前端当前演示价格对应：20 USDT / 0.00001 USDT ≈ 2,000,000 STG）
  private static NOMINAL_MINT_COST_STG = 2_000_000

  // 战力参考与加成参数：以800为参考点，线性加成，范围-20% ~ +50%
  private static POWER_REF = 800
  private static POWER_BOOST_DIVISOR = 1600 // (power - 800)/1600 ≈ ±(0.2~0.5) 区间
  private static MIN_BOOST = -0.2
  private static MAX_BOOST = 0.5

  // 稀有度日利率（与之前文案一致：8%~28%/日）
  static getDailyRewardRate(rarity: string): number {
    const rates = {
      'common': 0.08,     // 每日8%
      'rare': 0.12,       // 每日12%
      'epic': 0.16,       // 每日16%
      'legendary': 0.22,  // 每日22%
      'mythic': 0.28      // 每日28%
    }
    return rates[rarity as keyof typeof rates] || rates.common
  }

  // 基于战力的加成因子（-20% ~ +50%）
  private static getPowerBoostFactor(power: number): number {
    const raw = (power - this.POWER_REF) / this.POWER_BOOST_DIVISOR
    const clamped = Math.max(this.MIN_BOOST, Math.min(this.MAX_BOOST, raw))
    return 1 + clamped
  }

  // 计算英雄的“名义本金”
  static getNominalMintCostSTG(): number {
    return this.NOMINAL_MINT_COST_STG
  }

  // 计算英雄的每日STG奖励：名义成本 × 稀有度日利率 × 战力加成
  static calculateDailyReward(hero: HeroAttributes): number {
    const principal = this.NOMINAL_MINT_COST_STG
    const rate = this.getDailyRewardRate(hero.rarity)
    const powerBoost = this.getPowerBoostFactor(hero.power)
    return Math.floor(principal * rate * powerBoost)
  }

  // 预估该英雄年化（APY），基于名义成本
  static estimateHeroAPY(hero: HeroAttributes): number {
    const daily = this.calculateDailyReward(hero)
    const principal = this.NOMINAL_MINT_COST_STG
    const dailyPercent = daily / principal // 每日收益率
    return dailyPercent * 365 * 100 // 年化百分比
  }

  // 获取已质押的英雄（加载时按照当前模型重算日奖励，确保模型调整即时生效）
  static getStakedHeroes(): StakedHero[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return []
    try {
      const raw: StakedHero[] = JSON.parse(stored)
      return raw.map((h) => ({
        ...h,
        // 以新模型重算
        dailyReward: this.calculateDailyReward(h),
        isStaked: true,
      }))
    } catch {
      return []
    }
  }

  // 质押英雄
  static stakeHero(hero: HeroAttributes): StakedHero {
    const stakedHero: StakedHero = {
      ...hero,
      stakedAt: Date.now(),
      dailyReward: this.calculateDailyReward(hero),
      totalEarned: 0,
      isStaked: true
    }

    const stakedHeroes = this.getStakedHeroes()
    stakedHeroes.push(stakedHero)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stakedHeroes))
    return stakedHero
  }

  // 取消质押英雄
  static unstakeHero(heroId: string): { hero: HeroAttributes; earnings: number; penalty: number } {
    const stakedHeroes = this.getStakedHeroes()
    const heroIndex = stakedHeroes.findIndex(h => h.id === heroId)
    if (heroIndex === -1) {
      throw new Error('英雄未找到')
    }

    const stakedHero = stakedHeroes[heroIndex]
    const earnings = this.calculateCurrentEarnings(stakedHero)
    const penalty = Math.floor(earnings * 0.1) // 10% 罚金
    const netEarnings = earnings - penalty

    stakedHeroes.splice(heroIndex, 1)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stakedHeroes))

    this.addEarnings(netEarnings)

    const { stakedAt, dailyReward, totalEarned, isStaked, ...originalHero } = stakedHero
    return {
      hero: originalHero,
      earnings: netEarnings,
      penalty
    }
  }

  // 计算当前收益（线性按天）
  static calculateCurrentEarnings(stakedHero: StakedHero): number {
    const now = Date.now()
    const stakedDuration = now - stakedHero.stakedAt
    const daysStaked = stakedDuration / (1000 * 60 * 60 * 24)
    return Math.floor(daysStaked * stakedHero.dailyReward)
  }

  // 获取质押统计
  static getStakingStats(): StakingStats {
    const stakedHeroes = this.getStakedHeroes()
    const totalLifetimeEarnings = this.getTotalEarnings()
    const totalDailyRewards = stakedHeroes.reduce((sum, hero) => sum + hero.dailyReward, 0)

    // 按当前模型“名义本金”计算平均APY
    const principal = this.NOMINAL_MINT_COST_STG
    const averageAPY = stakedHeroes.length > 0
      ? (stakedHeroes.reduce((sum, hero) => sum + (hero.dailyReward / principal), 0) / stakedHeroes.length) * 365 * 100
      : 0

    return {
      totalStaked: stakedHeroes.length,
      totalDailyRewards,
      totalLifetimeEarnings,
      averageAPY
    }
  }

  // 添加收益记录
  private static addEarnings(amount: number): void {
    const currentEarnings = this.getTotalEarnings()
    localStorage.setItem(this.EARNINGS_KEY, (currentEarnings + amount).toString())
  }

  // 获取总收益
  static getTotalEarnings(): number {
    if (typeof window === 'undefined') return 0
    const stored = localStorage.getItem(this.EARNINGS_KEY)
    return stored ? parseFloat(stored) : 0
  }

  // 领取所有奖励
  static claimAllRewards(): number {
    const stakedHeroes = this.getStakedHeroes()
    let totalRewards = 0

    const updatedHeroes = stakedHeroes.map(hero => {
      const currentEarnings = this.calculateCurrentEarnings(hero)
      totalRewards += currentEarnings
      return {
        ...hero,
        stakedAt: Date.now(), // 重置质押时间
        totalEarned: hero.totalEarned + currentEarnings
      }
    })

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHeroes))
    this.addEarnings(totalRewards)
    return totalRewards
  }

  // 获取可用于质押的英雄（从铸造历史中获取未质押的）
  static getAvailableHeroes(): HeroAttributes[] {
    if (typeof window === 'undefined') return []
    const mintHistory = localStorage.getItem('mintHistory')
    const stakedHeroes = this.getStakedHeroes()
    const stakedIds = new Set(stakedHeroes.map(h => h.id))
    if (!mintHistory) return []
    try {
      const allHeroes: HeroAttributes[] = JSON.parse(mintHistory)
      return allHeroes.filter(hero => !stakedIds.has(hero.id))
    } catch {
      return []
    }
  }
}
