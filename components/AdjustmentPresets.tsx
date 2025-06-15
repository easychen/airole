"use client"

import React from "react"
import { Button } from "@/components/ui/button"

interface AdjustmentPresetsProps {
  interfaceLanguage: 'zh' | 'en'
  presets: Array<{ name: string; content: string }>
  onApplyPreset: (content: string) => void
}

export function AdjustmentPresets({
  interfaceLanguage,
  presets,
  onApplyPreset
}: AdjustmentPresetsProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">
        {interfaceLanguage === 'zh' ? '常用调整方案：' : 'Common Adjustments:'}
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset, index) => (
          <Button
            key={index}
            onClick={() => onApplyPreset(preset.content)}
            size="sm"
            variant="outline"
            className="text-xs h-7"
          >
            {preset.name}
          </Button>
        ))}
      </div>
    </div>
  )
} 