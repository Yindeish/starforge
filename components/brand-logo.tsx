"use client"

import { useState } from "react"
import Image from "next/image"

interface BrandLogoProps {
  variant?: "main" | "crystal" | "fusion" | "dynamic" | "minimal"
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
}

export function BrandLogo({ variant = "fusion", size = "md", showText = true, className = "" }: BrandLogoProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  }

  const logoPath = `/logos/stg-logo-${variant}.png`

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
        {!imageError ? (
          <Image
            src={logoPath || "/placeholder.svg"}
            alt="SAF Token Logo"
            width={96}
            height={96}
            className="w-full h-full object-contain drop-shadow-lg"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg`}
          >
            <span className="text-white font-bold text-xs">SAF</span>
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent ${textSizeClasses[size]}`}
          >
            StarForge
          </span>
          {size !== "sm" && <span className="text-xs text-gray-400 -mt-1">SAF Token</span>}
        </div>
      )}
    </div>
  )
}
