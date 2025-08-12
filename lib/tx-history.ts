export type TxType = 'mint' | 'stake' | 'unstake' | 'claim' | 'battle'

export interface TxEntry {
  id: string
  type: TxType
  amountSTG: number // negative for spend, positive for reward
  hash?: string
  tokenIds?: number[]
  timestamp: number
  meta?: Record<string, any>
}

const KEY = 'txHistory'

function readAll(): TxEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as TxEntry[]) : []
  } catch {
    return []
  }
}

function writeAll(list: TxEntry[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {}
}

export function addMintTx(params: { totalCostSTG: number; tokenIds: number[]; txHash?: string }) {
  const list = readAll()
  const entry: TxEntry = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: 'mint',
    amountSTG: -Math.abs(params.totalCostSTG),
    hash: params.txHash,
    tokenIds: params.tokenIds,
    timestamp: Date.now(),
  }
  writeAll([entry, ...list].slice(0, 100)) // keep latest 100
}

export function getRecentTx(limit = 10): TxEntry[] {
  const list = readAll()
  return list.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
}
