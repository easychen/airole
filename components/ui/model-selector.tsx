"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ModelSelectorProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export const ModelSelector = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Enter model name..."
}: ModelSelectorProps) => {
  const [isCustom, setIsCustom] = useState(false)
  const [customValue, setCustomValue] = useState("")

  // 检查当前值是否在预定义选项中
  useEffect(() => {
    const isInOptions = options.some(option => option.value === value)
    if (!isInOptions && value) {
      setIsCustom(true)
      setCustomValue(value)
    } else {
      setIsCustom(false)
      setCustomValue("")
    }
  }, [value, options])

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "custom") {
      setIsCustom(true)
      setCustomValue(value)
    } else {
      setIsCustom(false)
      setCustomValue("")
      onChange(selectedValue)
    }
  }

  const handleCustomChange = (customVal: string) => {
    setCustomValue(customVal)
    onChange(customVal)
  }

  return (
    <div className="space-y-2">
      <Select value={isCustom ? "custom" : value} onValueChange={handleSelectChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom / 自定义</SelectItem>
        </SelectContent>
      </Select>
      {isCustom && (
        <Input
          value={customValue}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  )
} 