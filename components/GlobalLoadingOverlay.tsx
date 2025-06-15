"use client"

import React from "react"

interface GlobalLoadingOverlayProps {
  interfaceLanguage: 'zh' | 'en'
  globalLoading: {
    isLoading: boolean
    status: string
    type: string
  }
}

export function GlobalLoadingOverlay({
  interfaceLanguage,
  globalLoading
}: GlobalLoadingOverlayProps) {
  if (!globalLoading.isLoading) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4 max-w-sm mx-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <div className="text-lg font-medium text-gray-900">{globalLoading.status}</div>
        {globalLoading.type === "image" && (
          <div className="text-sm text-gray-600 text-center">
            {interfaceLanguage === 'zh' ? '正在分析您的图片，请稍等...' : 'Analyzing your image, please wait...'}
          </div>
        )}
      </div>
    </div>
  )
} 