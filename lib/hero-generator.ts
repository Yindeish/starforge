export interface HeroAttributes {
  id: string
  name: string
  faction: 'mechanical-empire' | 'astral-conclave' | 'void-reavers'
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
  class: string
  power: number
  health: number
  attack: number
  defense: number
  speed: number
  abilities: string[]
  image: string
  background: string
  description: string
  mintedAt: number
  tokenId?: number
}

export interface RarityConfig {
  name: string
  probability: number
  powerRange: [number, number]
  healthRange: [number, number]
  attackRange: [number, number]
  defenseRange: [number, number]
  speedRange: [number, number]
  abilityCount: number
  color: string
  glow: string
}

export const RARITY_CONFIG: Record<string, RarityConfig> = {
  common: {
    name: '普通',
    probability: 0.60,
    powerRange: [300, 500],
    healthRange: [80, 120],
    attackRange: [60, 90],
    defenseRange: [50, 80],
    speedRange: [40, 70],
    abilityCount: 2,
    color: 'bg-gray-500',
    glow: 'shadow-gray-500/20'
  },
  rare: {
    name: '稀有',
    probability: 0.25,
    powerRange: [500, 750],
    healthRange: [120, 160],
    attackRange: [90, 130],
    defenseRange: [80, 120],
    speedRange: [70, 100],
    abilityCount: 3,
    color: 'bg-blue-500',
    glow: 'shadow-blue-500/30'
  },
  epic: {
    name: '史诗',
    probability: 0.10,
    powerRange: [750, 1000],
    healthRange: [160, 200],
    attackRange: [130, 170],
    defenseRange: [120, 160],
    speedRange: [100, 130],
    abilityCount: 4,
    color: 'bg-purple-500',
    glow: 'shadow-purple-500/40'
  },
  legendary: {
    name: '传奇',
    probability: 0.04,
    powerRange: [1000, 1300],
    healthRange: [200, 250],
    attackRange: [170, 220],
    defenseRange: [160, 200],
    speedRange: [130, 160],
    abilityCount: 5,
    color: 'bg-yellow-500',
    glow: 'shadow-yellow-500/50'
  },
  mythic: {
    name: '神话',
    probability: 0.01,
    powerRange: [1300, 1600],
    healthRange: [250, 300],
    attackRange: [220, 280],
    defenseRange: [200, 250],
    speedRange: [160, 200],
    abilityCount: 6,
    color: 'bg-gradient-to-r from-pink-500 to-purple-500',
    glow: 'shadow-pink-500/60'
  }
}

export const FACTION_CONFIG = {
  'mechanical-empire': {
    name: '机械帝国',
    classes: ['赛博战士', '机械守卫', '量子工程师', '纳米医师', '等离子炮手'],
    abilities: [
      '激光射击', '护盾充能', '等离子斩击', '战术分析', '能量护盾',
      '双重轰击', '纳米修复', '全息指挥', '电磁脉冲', '量子传送',
      '机械统御', '能量巨锤', '浮空无人机', '全息护盾', '领域控制'
    ],
    backgrounds: [
      '赛博都市天际线', '机械工厂内部', '量子实验室', '太空战舰舰桥', '纳米制造中心'
    ]
  },
  'astral-conclave': {
    name: '星灵议会',
    classes: ['星光法师', '宇宙祭司', '星辰术士', '天体守护者', '银河贤者'],
    abilities: [
      '星光弹', '冥想回复', '水晶爆发', '星云护盾', '能量汲取',
      '星辉权杖', '行星轨道', '宇宙符文', '能量波动', '时空扭曲',
      '星辰之刃', '银河之翼', '宇宙爆发', '星云领域', '创世之光'
    ],
    backgrounds: [
      '星光神殿', '宇宙观测台', '水晶花园', '星云漩涡', '天体圣殿'
    ]
  },
  'void-reavers': {
    name: '虚空掠夺者',
    classes: ['虚空战士', '暗影刺客', '腐蚀术士', '虚空军阀', '混沌领主'],
    abilities: [
      '暗影刃', '虚空潜行', '双刃突袭', '腐蚀毒雾', '暗影步',
      '死亡镰刀', '骨翼飞行', '死灵能量', '虚空触手', '虚空裂隙',
      '虚空巨斧', '骷髅之翼', '死灵漩涡', '混沌领域', '末日审判'
    ],
    backgrounds: [
      '虚空裂隙', '腐蚀战场', '骨刺要塞', '暗影深渊', '混沌神殿'
    ]
  }
}

export class HeroGenerator {
  private static getRandomRarity(): string {
    const random = Math.random()
    let cumulativeProbability = 0
    
    for (const [rarity, config] of Object.entries(RARITY_CONFIG)) {
      cumulativeProbability += config.probability
      if (random <= cumulativeProbability) {
        return rarity
      }
    }
    
    return 'common'
  }

  private static getRandomFaction(): keyof typeof FACTION_CONFIG {
    const factions = Object.keys(FACTION_CONFIG) as (keyof typeof FACTION_CONFIG)[]
    return factions[Math.floor(Math.random() * factions.length)]
  }

  private static generateStats(rarity: string) {
    const config = RARITY_CONFIG[rarity]
    
    const health = Math.floor(Math.random() * (config.healthRange[1] - config.healthRange[0] + 1)) + config.healthRange[0]
    const attack = Math.floor(Math.random() * (config.attackRange[1] - config.attackRange[0] + 1)) + config.attackRange[0]
    const defense = Math.floor(Math.random() * (config.defenseRange[1] - config.defenseRange[0] + 1)) + config.defenseRange[0]
    const speed = Math.floor(Math.random() * (config.speedRange[1] - config.speedRange[0] + 1)) + config.speedRange[0]
    
    // 计算综合战力
    const power = Math.floor((health * 2 + attack * 3 + defense * 2 + speed * 1.5) / 2)
    
    return { power, health, attack, defense, speed }
  }

  private static generateAbilities(faction: keyof typeof FACTION_CONFIG, rarity: string): string[] {
    const factionAbilities = FACTION_CONFIG[faction].abilities
    const abilityCount = RARITY_CONFIG[rarity].abilityCount
    
    // 随机选择技能
    const shuffled = [...factionAbilities].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, abilityCount)
  }

  private static generateName(faction: keyof typeof FACTION_CONFIG, heroClass: string): string {
    const factionName = FACTION_CONFIG[faction].name
    const randomId = Math.floor(Math.random() * 9999) + 1
    return `${heroClass} #${randomId.toString().padStart(4, '0')}`
  }

  private static getHeroImage(faction: keyof typeof FACTION_CONFIG, rarity: string): string {
    // 根据派系和稀有度返回对应的NFT图片
    const imageMap: Record<string, Record<string, string>> = {
      'mechanical-empire': {
        'common': '/nft/mechanical-empire-common-1.png',
        'rare': '/nft/mechanical-empire-rare-1.png',
        'epic': '/nft/mechanical-empire-epic-1.png',
        'legendary': '/nft/mechanical-empire-legendary-1.png',
        'mythic': '/nft/mechanical-empire-legendary-1.png' // 使用传奇作为神话的替代
      },
      'astral-conclave': {
        'common': '/nft/astral-conclave-common-1.png',
        'rare': '/nft/astral-conclave-rare-1.png',
        'epic': '/nft/astral-conclave-epic-1.png',
        'legendary': '/nft/astral-conclave-legendary-1.png',
        'mythic': '/nft/astral-conclave-legendary-1.png'
      },
      'void-reavers': {
        'common': '/nft/void-reavers-common-1.png',
        'rare': '/nft/void-reavers-rare-1.png',
        'epic': '/nft/void-reavers-epic-1.png',
        'legendary': '/nft/void-reavers-legendary-1.png',
        'mythic': '/nft/void-reavers-legendary-1.png'
      }
    }
    
    return imageMap[faction]?.[rarity] || '/placeholder.svg'
  }

  public static generateHero(): HeroAttributes {
    const rarity = this.getRandomRarity()
    const faction = this.getRandomFaction()
    const factionConfig = FACTION_CONFIG[faction]
    const heroClass = factionConfig.classes[Math.floor(Math.random() * factionConfig.classes.length)]
    const stats = this.generateStats(rarity)
    const abilities = this.generateAbilities(faction, rarity)
    const name = this.generateName(faction, heroClass)
    const background = factionConfig.backgrounds[Math.floor(Math.random() * factionConfig.backgrounds.length)]
    
    return {
      id: `hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      faction,
      rarity: rarity as any,
      class: heroClass,
      ...stats,
      abilities,
      image: this.getHeroImage(faction, rarity),
      background,
      description: `来自${factionConfig.name}的${RARITY_CONFIG[rarity].name}${heroClass}，掌握着${abilities.length}种强大技能。`,
      mintedAt: Date.now()
    }
  }

  public static generateMultipleHeroes(count: number): HeroAttributes[] {
    return Array.from({ length: count }, () => this.generateHero())
  }
}
