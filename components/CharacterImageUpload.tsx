"use client"

import React, { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, ArrowLeft, SkipForward } from "lucide-react"
import { UI_TEXTS } from "@/lib/i18n"

interface CharacterImageUploadProps {
  interfaceLanguage: 'zh' | 'en'
  characterImage: string
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  globalLoading: {
    isLoading: boolean
    status: string
    type: string
  }
  onGoBack?: () => void
  onSkip?: () => void
}

export function CharacterImageUpload({
  interfaceLanguage,
  characterImage,
  onImageUpload,
  globalLoading,
  onGoBack,
  onSkip
}: CharacterImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = UI_TEXTS[interfaceLanguage]

  // 检查是否已上传图片（不是默认placeholder）
  const hasUploadedImage = characterImage && !characterImage.includes("placeholder.svg")

  return (
    <div className="flex-1 flex items-center justify-center px-4 pb-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{t.uploadCharacterImage}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600 mb-6">
            {t.uploadDesc}
          </p>
          <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden border-2 border-dashed border-border hover:border-muted-foreground transition-colors">
            <img
              src={characterImage || "/placeholder.svg"}
              alt="Character"
              className="w-full h-full object-cover"
            />
          </div>
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            onChange={onImageUpload} 
            className="hidden" 
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
            variant="default"
            disabled={globalLoading.isLoading}
            size="lg"
          >
            <Upload className="w-5 h-5 mr-2" />
            {t.selectImage}
          </Button>
          <div className="text-xs text-gray-500 text-center">
            {t.supportedFormats}
          </div>
          
          {/* 返回和跳过按钮 */}
          <div className="flex gap-3 pt-4 border-t">
            {onGoBack && (
              <Button
                onClick={onGoBack}
                variant="outline"
                className="flex-1"
                disabled={globalLoading.isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {interfaceLanguage === 'zh' ? '返回设置' : 'Back to Settings'}
              </Button>
            )}
            {onSkip && (
              <Button
                onClick={onSkip}
                variant="outline"
                className="flex-1"
                disabled={globalLoading.isLoading}
              >
                <SkipForward className="w-4 h-4 mr-2" />
                {interfaceLanguage === 'zh' ? '跳过上传' : 'Skip Upload'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 