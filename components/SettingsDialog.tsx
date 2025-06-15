"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ModelSelector } from "@/components/ui/model-selector"
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

interface SettingsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  apiKey: string
  setApiKey: (value: string) => void
  apiBaseUrl: string
  setApiBaseUrl: (value: string) => void
  imageModel: string
  setImageModel: (value: string) => void
  chatModel: string
  setChatModel: (value: string) => void
  eventBookModel: string
  setEventBookModel: (value: string) => void
  language: string
  setLanguage: (value: string) => void
  customLanguage: string
  setCustomLanguage: (value: string) => void
  interfaceLanguage: 'zh' | 'en'
  setInterfaceLanguage: (value: 'zh' | 'en') => void
  onSave: () => void
  onClear: () => void
}

export const SettingsDialog = ({
  isOpen,
  onOpenChange,
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
  interfaceLanguage,
  setInterfaceLanguage,
  onSave,
  onClear
}: SettingsDialogProps) => {
  const t = UI_TEXTS[interfaceLanguage]
  const currentLanguageConfig = getLanguageSpecificConfig(interfaceLanguage)
  const currentModelOptions = getLanguageSpecificModelOptions(interfaceLanguage)

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

  // 获取当前语言显示名称
  const getCurrentLanguageDisplay = () => {
    if (language === "custom") {
      return customLanguage || "Custom Language"
    }
    return LANGUAGE_OPTIONS.find((opt) => opt.value === language)?.label || "中文 (简体)"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.settings}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="interfacelang">{t.interfaceLanguage}</Label>
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
            <Label htmlFor="apikey">{t.apiKey}</Label>
            <div className="flex gap-2">
              <Input
                id="apikey"
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
            <Label htmlFor="apibaseurl">{t.apiBaseUrl}</Label>
            <Input
              id="apibaseurl"
              type="url"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder={currentLanguageConfig.API_BASE_URL}
            />
          </div>
          <div>
            <Label htmlFor="imagemodel">{t.imageModel}</Label>
            <ModelSelector
              value={imageModel}
              onChange={setImageModel}
              options={currentModelOptions.IMAGE_MODEL_OPTIONS}
              placeholder="Enter image model name..."
            />
          </div>
          <div>
            <Label htmlFor="chatmodel">{t.chatModel}</Label>
            <ModelSelector
              value={chatModel}
              onChange={setChatModel}
              options={currentModelOptions.CHAT_MODEL_OPTIONS}
              placeholder="Enter chat model name..."
            />
          </div>
          {FEATURE_FLAGS.SHOW_EVENT_BOOK && (
            <div>
              <Label htmlFor="eventbookmodel">{t.eventBookModel}</Label>
              <ModelSelector
                value={eventBookModel}
                onChange={setEventBookModel}
                options={currentModelOptions.CHAT_MODEL_OPTIONS}
                placeholder="Enter event book model name..."
              />
            </div>
          )}
          {/* <div>
            <Label htmlFor="language">{t.characterCardLanguage}</Label>
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
          </div>
          {language === "custom" && (
            <div>
              <Label htmlFor="customlang">{t.customLanguage}</Label>
              <Input
                id="customlang"
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                placeholder={t.customLanguageDesc}
              />
            </div>
          )}
          <div className="text-sm text-gray-600">{t.current}: {getCurrentLanguageDisplay()}</div>
           */}
          <Separator />
          
          {/* Links to Privacy Policy and User Guide */}
          <div className="flex justify-center gap-4 text-sm">
            <Link 
              href={`/privacy-policy?lang=${interfaceLanguage}`}
              className="text-muted-foreground hover:text-foreground underline"
              onClick={() => onOpenChange(false)}
            >
              {t.privacyPolicy}
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link 
              href={`/terms-of-service?lang=${interfaceLanguage}`}
              className="text-muted-foreground hover:text-foreground underline"
              onClick={() => onOpenChange(false)}
            >
              {t.termsOfService}
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link 
              href={`/user-guide?lang=${interfaceLanguage}`}
              className="text-muted-foreground hover:text-foreground underline"
              onClick={() => onOpenChange(false)}
            >
              {t.userGuide}
            </Link>
          </div>
          
          <div className="flex justify-between gap-2">
            <Button onClick={onClear} variant="destructive" size="sm">
              {t.clearSettings}
            </Button>
            <div className="flex gap-2">
              <Button onClick={() => onOpenChange(false)} variant="outline">
                {t.cancel}
              </Button>
              <Button onClick={onSave}>{t.save}</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 