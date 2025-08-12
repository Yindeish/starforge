const hasChinese = (s: string) => /[\u4e00-\u9fff]/.test(s || '')

const classMapZhToEn: Record<string, string> = {
  // Mechanical Empire
  '赛博战士': 'Cyber Warrior',
  '机械守卫': 'Mech Guardian',
  '量子工程师': 'Quantum Engineer',
  '纳米医师': 'Nano Medic',
  '等离子炮手': 'Plasma Gunner',
  '机械指挥官': 'Mech Commander',
  '赛博霸主': 'Cyber Overlord',
  // Astral Conclave
  '星光法师': 'Starlight Mage',
  '宇宙祭司': 'Cosmic Priest',
  '星辰术士': 'Celestial Warlock',
  '天体守护者': 'Astral Guardian',
  '银河贤者': 'Galactic Sage',
  '天体祭司': 'Astral Priest',
  '宇宙君主': 'Cosmic Sovereign',
  // Void Reavers
  '虚空战士': 'Void Warrior',
  '暗影刺客': 'Shadow Assassin',
  '腐蚀术士': 'Corruption Warlock',
  '虚空军阀': 'Void Warlord',
  '混沌领主': 'Chaos Lord',
  '虚空刺客': 'Void Assassin',
  '虚空霸主': 'Void Overlord',
}

const fullNameMapZhToEn: Record<string, string> = {
  '机械战士 Alpha': 'Mech Warrior Alpha',
  '赛博武士 Beta': 'Cyber Samurai Beta',
  '机械指挥官 Gamma': 'Mech Commander Gamma',
  '赛博霸主 Omega': 'Cyber Overlord Omega',

  '星光法师 Alpha': 'Starlight Mage Alpha',
  '星辰术士 Beta': 'Celestial Warlock Beta',
  '天体祭司 Gamma': 'Astral Priest Gamma',
  '宇宙君主 Omega': 'Cosmic Sovereign Omega',

  '虚空战士 Alpha': 'Void Warrior Alpha',
  '虚空刺客 Beta': 'Void Assassin Beta',
  '虚空军阀 Gamma': 'Void Warlord Gamma',
  '虚空霸主 Omega': 'Void Overlord Omega',
}

// Ability translation map (zh -> en)
const abilityMapZhToEn: Record<string, string> = {
  // Mechanical
  '激光射击': 'Laser Shot',
  '护盾充能': 'Shield Recharge',
  '等离子斩击': 'Plasma Slash',
  '战术分析': 'Tactical Analysis',
  '能量护盾': 'Energy Shield',
  '双重轰击': 'Dual Barrage',
  '纳米翅膀': 'Nano Wings',
  '纳米修复': 'Nano Repair',
  '全息指挥': 'Holographic Command',
  '全息护盾': 'Holographic Shield',
  '电磁脉冲': 'EMP',
  '量子传送': 'Quantum Teleport',
  '领域控制': 'Field Control',
  '机械统御': 'Mechanical Dominion',
  '能量巨锤': 'Energy Maul',
  '浮空无人机': 'Hover Drones',
  // Astral
  '星光弹': 'Starlight Bolt',
  '冥想回复': 'Meditative Recovery',
  '水晶爆发': 'Crystal Burst',
  '星云护盾': 'Nebula Shield',
  '能量汲取': 'Energy Drain',
  '星辉权杖': 'Stellar Scepter',
  '行星轨道': 'Planetary Orbit',
  '宇宙符文': 'Cosmic Rune',
  '能量波动': 'Energy Surge',
  '时空扭曲': 'Spacetime Warp',
  '星辰之刃': 'Blade of Stars',
  '银河之翼': 'Wings of the Galaxy',
  '宇宙爆发': 'Cosmic Burst',
  '星云领域': 'Nebula Domain',
  '创世之光': 'Light of Genesis',
  // Void
  '暗影刃': 'Shadow Blade',
  '虚空潜行': 'Void Stealth',
  '双刃突袭': 'Twinblade Assault',
  '腐蚀毒雾': 'Corrosive Miasma',
  '暗影步': 'Shadow Step',
  '死亡镰刀': 'Death Scythe',
  '骨翼飞行': 'Bonewing Flight',
  '死灵能量': 'Necro Energy',
  '虚空触手': 'Void Tendrils',
  '虚空裂隙': 'Void Rift',
  '虚空巨斧': 'Void Greataxe',
  '骷髅之翼': 'Wings of Skulls',
  '死灵漩涡': 'Necro Vortex',
  '混沌领域': 'Chaos Field',
  '末日审判': 'Doomsday Judgement',
}

function translateByPattern(name: string): string {
  const mHash = name.match(/^([\u4e00-\u9fff]+)\s*#(\d{1,})$/)
  if (mHash) {
    const clsEn = classMapZhToEn[mHash[1]] || mHash[1]
    return `${clsEn} #${mHash[2]}`
  }
  const mGreek = name.match(/^([\u4e00-\u9fff]+)\s+(Alpha|Beta|Gamma|Omega)$/i)
  if (mGreek) {
    const clsEn = classMapZhToEn[mGreek[1]] || mGreek[1]
    return `${clsEn} ${mGreek[2]}`
  }
  let out = name
  for (const [zh, en] of Object.entries(classMapZhToEn)) {
    out = out.replaceAll(zh, en)
  }
  return out
}

export function translateHeroName(name: string, target: 'en' | 'zh' = 'en') {
  if (!name) return ''
  if (target === 'en') {
    if (!hasChinese(name)) return name
    if (fullNameMapZhToEn[name]) return fullNameMapZhToEn[name]
    return translateByPattern(name)
  }
  return name
}

// Exported: translate class only (without number suffix)
export function translateClassName(cls: string, target: 'en' | 'zh' = 'en') {
  if (!cls) return ''
  if (target === 'en') {
    if (hasChinese(cls)) return classMapZhToEn[cls] || cls
    return cls
  }
  return cls
}

export function translateAbility(name: string, target: 'en' | 'zh' = 'en') {
  if (!name) return ''
  if (target === 'en') {
    if (!hasChinese(name)) return name
    return abilityMapZhToEn[name] || name
  }
  return name
}
