import { ethers } from "ethers"

// STG代币合约ABI (简化版)
export const STG_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
]

// 英雄NFT合约ABI (简化版)
export const HERO_NFT_ABI = [
  "function mint(address to, string memory tokenURI) returns (uint256)",
  "function mintWithSTG(uint256 amount) returns (uint256)",
  "function tokenCounter() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "event HeroMinted(address indexed to, uint256 indexed tokenId, string tokenURI)",
]

// 质押合约ABI (简化版)
export const STAKING_ABI = [
  "function stake(uint256[] tokenIds) returns (bool)",
  "function unstake(uint256[] tokenIds) returns (bool)",
  "function claimRewards() returns (uint256)",
  "function getStakedTokens(address owner) view returns (uint256[])",
  "function getPendingRewards(address owner) view returns (uint256)",
  "function getStakingInfo(uint256 tokenId) view returns (uint256, uint256, uint256)",
  "event Staked(address indexed user, uint256[] tokenIds)",
  "event Unstaked(address indexed user, uint256[] tokenIds)",
  "event RewardsClaimed(address indexed user, uint256 amount)",
]

// 合约地址 (测试网地址，实际部署时需要替换)
export const CONTRACT_ADDRESSES = {
  STG_TOKEN: "0x6ab88be9d02bfeb0896cd0bce419d4caf5124444", // 替换为实际STG合约地址
  HERO_NFT: "0x0000000000000000000000000000000000000002", // 替换为实际NFT合约地址
  STAKING: "0x0000000000000000000000000000000000000003", // 替换为实际质押合约地址
  MINT_PRICE_STG: ethers.parseEther("2000"), // 2000 STG per mint
}

export class ContractService {
  private provider: ethers.BrowserProvider
  private signer: ethers.Signer

  constructor(provider: ethers.BrowserProvider) {
    this.provider = provider
    this.signer = provider.getSigner()
  }

  async getSTGContract() {
    return new ethers.Contract(CONTRACT_ADDRESSES.STG_TOKEN, STG_TOKEN_ABI, await this.signer)
  }

  async getHeroNFTContract() {
    return new ethers.Contract(CONTRACT_ADDRESSES.HERO_NFT, HERO_NFT_ABI, await this.signer)
  }

  async getStakingContract() {
    return new ethers.Contract(CONTRACT_ADDRESSES.STAKING, STAKING_ABI, await this.signer)
  }

  async getSTGBalance(address: string): Promise<string> {
    try {
      const contract = await this.getSTGContract()
      const balance = await contract.balanceOf(address)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error("获取STG余额失败:", error)
      // 返回模拟数据
      return (Math.random() * 5000 + 1000).toFixed(2)
    }
  }

  async approveSTG(amount: bigint): Promise<boolean> {
    try {
      const contract = await this.getSTGContract()
      const tx = await contract.approve(CONTRACT_ADDRESSES.HERO_NFT, amount)
      await tx.wait()
      return true
    } catch (error) {
      console.error("STG授权失败:", error)
      return false
    }
  }

  async checkSTGAllowance(owner: string): Promise<bigint> {
    try {
      const contract = await this.getSTGContract()
      return await contract.allowance(owner, CONTRACT_ADDRESSES.HERO_NFT)
    } catch (error) {
      console.error("检查STG授权失败:", error)
      return BigInt(0)
    }
  }

  async mintHero(heroData: any): Promise<{ success: boolean; tokenId?: number; txHash?: string; error?: string }> {
    try {
      // 在实际环境中，这里会调用智能合约
      // const contract = await this.getHeroNFTContract()
      // const tx = await contract.mintWithSTG(CONTRACT_ADDRESSES.MINT_PRICE_STG)
      // const receipt = await tx.wait()

      // 模拟铸造过程
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const tokenId = Math.floor(Math.random() * 10000) + 1
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

      return {
        success: true,
        tokenId,
        txHash,
      }
    } catch (error: any) {
      console.error("铸造英雄失败:", error)
      return {
        success: false,
        error: error.message || "铸造失败",
      }
    }
  }

  async batchMintHeroes(
    count: number,
  ): Promise<{ success: boolean; tokenIds?: number[]; txHash?: string; error?: string }> {
    try {
      // 模拟批量铸造
      await new Promise((resolve) => setTimeout(resolve, 5000))

      const tokenIds = Array.from({ length: count }, () => Math.floor(Math.random() * 10000) + 1)
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

      return {
        success: true,
        tokenIds,
        txHash,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "批量铸造失败",
      }
    }
  }

  // 质押相关方法
  async stakeHeroes(tokenIds: number[]): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // 模拟质押过程
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

      return {
        success: true,
        txHash,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "质押失败",
      }
    }
  }

  async unstakeHeroes(tokenIds: number[]): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // 模拟取消质押过程
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

      return {
        success: true,
        txHash,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "取消质押失败",
      }
    }
  }

  async claimStakingRewards(): Promise<{ success: boolean; amount?: number; txHash?: string; error?: string }> {
    try {
      // 模拟领取奖励过程
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const amount = Math.floor(Math.random() * 1000) + 100
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

      return {
        success: true,
        amount,
        txHash,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "领取奖励失败",
      }
    }
  }
}
