"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModelSelector } from "@/components/ui/model-selector"
import { VideoDialog } from "@/components/VideoDialog"
import { Play } from "lucide-react"
import { 
  DEFAULT_CONFIGS, 
  IMAGE_MODEL_OPTIONS, 
  CHAT_MODEL_OPTIONS, 
  LANGUAGE_OPTIONS, 
  INTERFACE_LANGUAGE_OPTIONS,
  getLanguageSpecificConfig,
  getLanguageSpecificModelOptions,
  FEATURE_FLAGS 
} from "@/lib/constants"
import { UI_TEXTS } from "@/lib/i18n"

interface WelcomeScreenProps {
  interfaceLanguage: 'zh' | 'en'
  setInterfaceLanguage: (lang: 'zh' | 'en') => void
  apiKey: string
  setApiKey: (key: string) => void
  apiBaseUrl: string
  setApiBaseUrl: (url: string) => void
  imageModel: string
  setImageModel: (model: string) => void
  chatModel: string
  setChatModel: (model: string) => void
  eventBookModel: string
  setEventBookModel: (model: string) => void
  language: string
  setLanguage: (lang: string) => void
  customLanguage: string
  setCustomLanguage: (lang: string) => void
  onContinue: () => void
}

export function WelcomeScreen({
  interfaceLanguage,
  setInterfaceLanguage,
  apiKey,
  setApiKey,
  apiBaseUrl,
  setApiBaseUrl,
  imageModel,
  setImageModel,
  chatModel,
  setChatModel,
  eventBookModel,
  setEventBookModel,
  language,
  setLanguage,
  customLanguage,
  setCustomLanguage,
  onContinue
}: WelcomeScreenProps) {
  const t = UI_TEXTS[interfaceLanguage]
  const currentLanguageConfig = getLanguageSpecificConfig(interfaceLanguage)
  const currentModelOptions = getLanguageSpecificModelOptions(interfaceLanguage)
  
  // 视频对话框状态
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false)
  const videoUrl = "https://res.airole.net/airole.net-demo-short.zip.mp4"

  const handleContinue = () => {
    // 保存设置到localStorage
    localStorage.setItem("character-generator-api-key", apiKey)
    localStorage.setItem("character-generator-api-base-url", apiBaseUrl)
    localStorage.setItem("character-generator-image-model", imageModel)
    localStorage.setItem("character-generator-chat-model", chatModel)
    localStorage.setItem("character-generator-event-book-model", eventBookModel)
    localStorage.setItem("character-generator-language", language)
    localStorage.setItem("character-generator-custom-language", customLanguage)
    localStorage.setItem("character-generator-interface-language", interfaceLanguage)
    onContinue()
  }

  // 当界面语言改变时，更新默认配置（如果当前值是默认值的话）
  const handleInterfaceLanguageChange = (newLang: 'zh' | 'en') => {
    const oldConfig = getLanguageSpecificConfig(interfaceLanguage)
    const newConfig = getLanguageSpecificConfig(newLang)
    const oldModelOptions = getLanguageSpecificModelOptions(interfaceLanguage)
    const newModelOptions = getLanguageSpecificModelOptions(newLang)
    
    // 如果当前值是旧语言的默认值，则更新为新语言的默认值
    if (apiBaseUrl === oldConfig.API_BASE_URL) {
      setApiBaseUrl(newConfig.API_BASE_URL)
    }
    if (imageModel === oldConfig.IMAGE_MODEL) {
      setImageModel(newConfig.IMAGE_MODEL)
    }
    if (chatModel === oldConfig.CHAT_MODEL) {
      setChatModel(newConfig.CHAT_MODEL)
    }
    if (eventBookModel === oldConfig.EVENT_BOOK_MODEL) {
      setEventBookModel(newConfig.EVENT_BOOK_MODEL)
    }
    
    // 如果当前模型不在新语言的模型选项中，则使用新语言的默认模型
    const newImageModelExists = newModelOptions.IMAGE_MODEL_OPTIONS.some(option => option.value === imageModel)
    if (!newImageModelExists) {
      setImageModel(newConfig.IMAGE_MODEL)
    }
    
    const newChatModelExists = newModelOptions.CHAT_MODEL_OPTIONS.some(option => option.value === chatModel)
    if (!newChatModelExists) {
      setChatModel(newConfig.CHAT_MODEL)
    }
    
    const newEventBookModelExists = newModelOptions.CHAT_MODEL_OPTIONS.some(option => option.value === eventBookModel)
    if (!newEventBookModelExists) {
      setEventBookModel(newConfig.EVENT_BOOK_MODEL)
    }
    
    setInterfaceLanguage(newLang)
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 pb-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center">{t.welcome}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
         
          
          {/* 演示视频按钮 */}
          <div className="text-center mb-6">
            <Button
              variant="outline"
              onClick={() => setIsVideoDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Play className="w-4 h-4 mr-2" />
              {t.watchDemo}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              {t.demoVideoDesc}
            </p>
          </div>

          <p className="text-center text-gray-600 mb-6">
            {t.welcomeDesc}
          </p>

          <div>
            <Label htmlFor="welcome-interfacelang">{t.interfaceLanguage}</Label>
            <Select value={interfaceLanguage} onValueChange={handleInterfaceLanguageChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERFACE_LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="welcome-apikey">{t.apiKey}</Label>
            <div className="flex gap-2">
              <Input
                id="welcome-apikey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={currentLanguageConfig.API_KEY_PLACEHOLDER}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(currentLanguageConfig.FREE_API_KEY_URL, '_blank')}
                className="whitespace-nowrap"
              >
                {t.freeApiKey}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="welcome-apibaseurl">{t.apiBaseUrl} ({t.optional})</Label>
            <Input
              id="welcome-apibaseurl"
              type="url"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder={currentLanguageConfig.API_BASE_URL}
            />
          </div>
          <div>
            <Label htmlFor="welcome-imagemodel">{t.imageModel}</Label>
            <ModelSelector
              value={imageModel}
              onChange={setImageModel}
              options={currentModelOptions.IMAGE_MODEL_OPTIONS}
              placeholder="Enter image model name..."
            />
          </div>
          <div>
            <Label htmlFor="welcome-chatmodel">{t.chatModel}</Label>
            <ModelSelector
              value={chatModel}
              onChange={setChatModel}
              options={currentModelOptions.CHAT_MODEL_OPTIONS}
              placeholder="Enter chat model name..."
            />
          </div>
          {FEATURE_FLAGS.SHOW_EVENT_BOOK && (
            <div>
              <Label htmlFor="welcome-eventbookmodel">{t.eventBookModel}</Label>
              <ModelSelector
                value={eventBookModel}
                onChange={setEventBookModel}
                options={currentModelOptions.CHAT_MODEL_OPTIONS}
                placeholder="Enter event book model name..."
              />
            </div>
          )}
          {/* <div>
            <Label htmlFor="welcome-language">{t.characterCardLanguage}</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectLanguage} />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
          {language === "custom" && (
            <div>
              <Label htmlFor="welcome-customlang">{t.customLanguage}</Label>
              <Input
                id="welcome-customlang"
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                placeholder={t.customLanguageDesc}
              />
            </div>
          )}
          <Button 
            onClick={handleContinue} 
            className="w-full" 
            disabled={!apiKey.trim()}
          >
            {t.continue}
          </Button>
        </CardContent>
      </Card>
      
      {/* 视频对话框 */}
      <VideoDialog
        isOpen={isVideoDialogOpen}
        onOpenChange={setIsVideoDialogOpen}
        interfaceLanguage={interfaceLanguage}
        videoUrl={videoUrl}
      />
    </div>
  )
} 