"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useRef } from "react"
import { ethers } from "ethers"
import { WalletConnectDialog, type WalletItem } from "./wallet-connect-dialog"

// EIP-6963 types (lightweight)
type EIP6963ProviderDetail = {
  provider: any
  info: {
    rdns: string
    uuid?: string
    name: string
    icon: string
  }
}

type EIP6963AnnounceEvent = {
  type: "eip6963:announceProvider"
  detail: EIP6963ProviderDetail
}

declare global {
  interface Window {
    ethereum?: any
  }
}

interface Web3ContextType {
  account: string | null
  provider: ethers.BrowserProvider | null
  chainId: number | null
  stgBalance: string
  bnbBalance: string
  stgPrice: number
  connectWallet: () => Promise<void> // opens modal now
  disconnectWallet: () => void
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

// Mock STG contract address kept for compatibility
const STG_CONTRACT_ADDRESS = "0x6ab88be9d02bfeb0896cd0bce419d4caf5124444"

const PREFERRED_WALLET_KEY = "preferred_wallet_rdns"

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [externalProvider, setExternalProvider] = useState<any>(null)
  const [chainId, setChainId] = useState<number | null>(null)

  const [stgBalance, setStgBalance] = useState("20000000")
  const [bnbBalance, setBnbBalance] = useState("0")
  const [stgPrice, setStgPrice] = useState(0.00001)

  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Wallet discovery
  const [wallets, setWallets] = useState<WalletItem[]>([])
  const [isDialogOpen, setDialogOpen] = useState(false)

  const announceHandled = useRef(false)

  // Discover EIP-6963 wallets and legacy provider
  useEffect(() => {
    function onAnnounce(e: Event) {
      const ev = e as unknown as EIP6963AnnounceEvent
      const { info, provider } = ev.detail
      setWallets((prev) => {
        if (prev.some((w) => w.info.rdns === info.rdns)) return prev
        return [...prev, { info: { name: info.name, rdns: info.rdns, icon: info.icon }, provider }]
      })
    }

    window.addEventListener("eip6963:announceProvider", onAnnounce as any)
    // Request providers to announce
    window.dispatchEvent(new Event("eip6963:requestProvider"))

    // Also consider legacy single-inject provider
    const legacy = window.ethereum
    if (legacy && !announceHandled.current) {
      announceHandled.current = true
      // Best-effort name detection
      const name = legacy.isMetaMask
        ? "MetaMask"
        : legacy.isRabby
          ? "Rabby"
          : legacy.isOKExWallet || legacy.isOKXWallet
            ? "OKX Wallet"
            : legacy.isBitKeep
              ? "Bitget Wallet"
              : legacy.isTrust
                ? "Trust Wallet"
                : "Injected Wallet"
      const rdns = legacy?.providerMap?.metamask
        ? "io.metamask"
        : legacy?.isRabby
          ? "io.rabby"
          : legacy?.isOKExWallet || legacy?.isOKXWallet
            ? "com.okex.wallet"
            : legacy?.isBitKeep
              ? "com.bitkeep.wallet"
              : legacy?.isTrust
                ? "com.trustwallet.app"
                : "injected.unknown"
      const icon = "" // unknown
      setWallets((prev) => {
        if (prev.some((w) => w.info.rdns === rdns)) return prev
        return [...prev, { info: { name, rdns, icon }, provider: legacy }]
      })
    }

    return () => {
      window.removeEventListener("eip6963:announceProvider", onAnnounce as any)
    }
  }, [])

  // Helper to fetch balances
  const getBalances = async (address: string, prov: ethers.BrowserProvider) => {
    try {
      const bnbBalance = await prov.getBalance(address)
      setBnbBalance(ethers.formatEther(bnbBalance))
      setStgBalance("20000000")
    } catch (err) {
      console.error("获取余额失败:", err)
      setStgBalance("20000000")
    }
  }

  // Main connect method now opens modal
  const connectWallet = async () => {
    setError(null)
    // If only one wallet is detected, connect directly; otherwise open selector
    if (wallets.length === 1) {
      await connectWithWallet(wallets[0])
      return
    }
    setDialogOpen(true)
  }

  // Connect with selected injected wallet
  const connectWithWallet = async (wallet: WalletItem) => {
    setIsConnecting(true)
    setError(null)
    try {
      const ext = wallet.provider
      // Request accounts
      const accounts = await ext.request({ method: "eth_requestAccounts" })
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found")
      }
      const browserProvider = new ethers.BrowserProvider(ext)
      const network = await browserProvider.getNetwork()

      setExternalProvider(ext)
      setProvider(browserProvider)
      setAccount(accounts[0])
      setChainId(Number(network.chainId))

      localStorage.setItem(PREFERRED_WALLET_KEY, wallet.info.rdns)

      // Fetch balances baseline
      await getBalances(accounts[0], browserProvider)

      // Attach listeners to the selected provider
      attachProviderListeners(ext)
      setDialogOpen(false)
      console.log("钱包连接成功:", accounts[0], wallet.info.name)
    } catch (err: any) {
      console.error("连接钱包失败:", err)
      if (err?.code === 4001) setError("用户拒绝连接钱包")
      else setError(err?.message || "连接钱包失败")
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setExternalProvider(null)
    setChainId(null)
    setStgBalance("0")
    setBnbBalance("0")
    setError(null)
    console.log("钱包已断开连接")
  }

  // Attach to provider events (accounts, chain, disconnect)
  const attachProviderListeners = (ext: any) => {
    if (!ext || !ext.on) return
    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet()
      } else {
        setAccount(accounts[0])
        setStgBalance("20000000")
        setBnbBalance("1.0")
      }
    }
    const handleChainChanged = (hexId: string | number) => {
      const id = typeof hexId === "string" ? Number.parseInt(String(hexId), 16) : Number(hexId)
      setChainId(id)
      setStgBalance("20000000")
      setBnbBalance("1.0")
    }
    const handleDisconnect = () => {
      disconnectWallet()
    }

    ext.on("accountsChanged", handleAccountsChanged)
    ext.on("chainChanged", handleChainChanged)
    ext.on("disconnect", handleDisconnect)
  }

  // Auto-reconnect to preferred wallet if present and approved
  useEffect(() => {
    const tryAutoConnect = async () => {
      if (account || isConnecting) return
      const preferred = localStorage.getItem(PREFERRED_WALLET_KEY)
      if (!preferred) return
      const found = wallets.find((w) => w.info.rdns === preferred)
      const ext = found?.provider || window.ethereum
      if (!ext) return
      try {
        const accounts = await ext.request({ method: "eth_accounts" })
        if (accounts && accounts.length > 0) {
          const browserProvider = new ethers.BrowserProvider(ext)
          const network = await browserProvider.getNetwork()
          setExternalProvider(ext)
          setProvider(browserProvider)
          setAccount(accounts[0])
          setChainId(Number(network.chainId))
          setStgBalance("20000000")
          setBnbBalance("1.0")
          attachProviderListeners(ext)
        }
      } catch (e) {
        // silent
      }
    }
    tryAutoConnect()
  }, [wallets]) // run after discovery

  // Simulate STG price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStgPrice((prev) => {
        const change = (Math.random() - 0.5) * 0.000002
        const next = prev + change
        return Math.max(0.000005, Math.min(0.00002, next))
      })
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Periodic balance refresh
  useEffect(() => {
    if (account && provider && chainId) {
      const interval = setInterval(() => {
        getBalances(account, provider)
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [account, provider, chainId])

  const value: Web3ContextType = {
    account,
    provider,
    chainId,
    stgBalance,
    bnbBalance,
    stgPrice,
    connectWallet, // now opens the dialog / connects detected wallet
    disconnectWallet,
    isConnected: !!account,
    isConnecting,
    error,
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
      {/* Wallet chooser dialog lives here so any page can open it via connectWallet() */}
      <WalletConnectDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        wallets={wallets}
        onSelect={connectWithWallet}
      />
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}
