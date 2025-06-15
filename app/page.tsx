"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Upload, Plus, Download, RefreshCw, History, MoreVertical, X, Check, Sun, Moon, Monitor } from "lucide-react"
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs"
import { Png } from "@/lib/Png"
import { ModelSelector } from "@/components/ui/model-selector"
import { 
  DEFAULT_CONFIGS, 
  ADJUSTMENT_PRESETS, 
  IMAGE_MODEL_OPTIONS, 
  CHAT_MODEL_OPTIONS, 
  LANGUAGE_OPTIONS, 
  INTERFACE_LANGUAGE_OPTIONS,
  getLanguageSpecificConfig,
  getLanguageSpecificModelOptions,
  FEATURE_FLAGS 
} from "@/lib/constants"
import type { 
  TavernCardV2, 
  EventBook, 
  ChatMessage, 
  CharacterVersion,
  CharacterBook 
} from "@/lib/types"
import { detectSystemLanguage, UI_TEXTS } from "@/lib/i18n"
import { extractJsonFromContent, exportAsJson, exportAsPng, getLanguagePrompts } from "@/lib/utils"
import { SettingsDialog } from "@/components/SettingsDialog"
import { WelcomeScreen } from "@/components/WelcomeScreen"
import { CharacterImageUpload } from "@/components/CharacterImageUpload"
import { ExportDialog } from "@/components/ExportDialog"
import { VersionHistoryDialog } from "@/components/VersionHistoryDialog"
import { EventBookDialog } from "@/components/EventBookDialog"
import { EventBookEditor } from "@/components/EventBookEditor"
import { GlobalLoadingOverlay } from "@/components/GlobalLoadingOverlay"
import { AdjustmentPresets } from "@/components/AdjustmentPresets"
import { ChatWindow } from "@/components/ChatWindow"
import { CharacterBookManager } from "@/components/CharacterBookManager"
import { GoogleDriveManager } from "@/components/GoogleDriveManager"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useTheme } from "next-themes"
import Image from "next/image"











export default function CharacterCardGenerator() {
  const [characterData, setCharacterData] = useState<TavernCardV2>({
    spec: "chara_card_v2",
    spec_version: "2.0",
    data: {
      name: "",
      description: "",
      personality: "",
      scenario: "",
      first_mes: "",
      mes_example: "",
      creator_notes: "",
      system_prompt: "",
      post_history_instructions: "",
      alternate_greetings: [],
      character_book: undefined,
      tags: [],
      creator: "",
      character_version: "1.0",
      extensions: {},
    },
  })

  // 版本管理state
  const [characterVersions, setCharacterVersions] = useState<CharacterVersion[]>([])
  const [currentVersionId, setCurrentVersionId] = useState<string>("")
  const [isVersionSelectorOpen, setIsVersionSelectorOpen] = useState(false)

  const [characterImage, setCharacterImage] = useState<string>("/placeholder.svg?height=400&width=300")
  const [apiKey, setApiKey] = useState("")
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_CONFIGS.API_BASE_URL)
  const [imageModel, setImageModel] = useState(DEFAULT_CONFIGS.IMAGE_MODEL)
  const [chatModel, setChatModel] = useState(DEFAULT_CONFIGS.CHAT_MODEL)
  const [eventBookModel, setEventBookModel] = useState(DEFAULT_CONFIGS.EVENT_BOOK_MODEL)
  const [language, setLanguage] = useState("en")
  const [customLanguage, setCustomLanguage] = useState("")
  const [interfaceLanguage, setInterfaceLanguage] = useState<'zh' | 'en'>('en')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [hasSkippedImageUpload, setHasSkippedImageUpload] = useState(false)

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  
  // Global loading state
  const [globalLoading, setGlobalLoading] = useState({
    isLoading: false,
    status: "",
    type: "" as "image" | "chat" | ""
  })

  // 添加事件书相关状态
  const [eventBook, setEventBook] = useState<EventBook | null>(null)
  const [isEventBookEditorOpen, setIsEventBookEditorOpen] = useState(false)
  const [isGeneratingEventBook, setIsGeneratingEventBook] = useState(false)
  const [eventBookJsonText, setEventBookJsonText] = useState("")
  
  // 新增状态
  const [isEventBookDialogOpen, setIsEventBookDialogOpen] = useState(false)
  const [eventBookBackground, setEventBookBackground] = useState("")
  const [eventBookCount, setEventBookCount] = useState(5)

  // 新增移动端Tab状态
  const [mobileActiveTab, setMobileActiveTab] = useState<'image' | 'attributes' | 'chat'>('image')

  // 新增移动端属性更新提示状态
  const [mobileAttributeUpdateNotification, setMobileAttributeUpdateNotification] = useState<{
    show: boolean
    message: string
    type: 'image-analysis' | 'ai-generation'
  }>({
    show: false,
    message: '',
    type: 'image-analysis'
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 等待客户端挂载完成
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get current UI texts based on interface language
  const t = UI_TEXTS[interfaceLanguage]

  // 获取当前语言的调整方案
  const getAdjustmentPresets = () => {
    return ADJUSTMENT_PRESETS[interfaceLanguage] || ADJUSTMENT_PRESETS.zh
  }

  // 从localStorage加载所有数据
  useEffect(() => {
    // 加载设置
    const savedApiKey = localStorage.getItem("character-generator-api-key")
    const savedApiBaseUrl = localStorage.getItem("character-generator-api-base-url")
    const savedImageModel = localStorage.getItem("character-generator-image-model")
    const savedChatModel = localStorage.getItem("character-generator-chat-model")
    const savedEventBookModel = localStorage.getItem("character-generator-event-book-model")
    const savedLanguage = localStorage.getItem("character-generator-language")
    const savedCustomLanguage = localStorage.getItem("character-generator-custom-language")
    const savedInterfaceLanguage = localStorage.getItem("character-generator-interface-language")

    // 加载角色数据
    const savedCharacterData = localStorage.getItem("character-generator-character-data")
    const savedCharacterImage = localStorage.getItem("character-generator-character-image")
    
    // 加载版本数据
    const savedVersions = localStorage.getItem("character-generator-versions")
    const savedCurrentVersionId = localStorage.getItem("character-generator-current-version-id")
    
    // 加载聊天记录
    const savedMessages = localStorage.getItem("character-generator-chat-messages")

    // 加载事件书数据
    const savedEventBook = localStorage.getItem("character-generator-event-book")
    
    // 确定界面语言
    let currentInterfaceLanguage: 'zh' | 'en' = 'en'
    if (savedInterfaceLanguage) {
      currentInterfaceLanguage = savedInterfaceLanguage as 'zh' | 'en'
      setInterfaceLanguage(currentInterfaceLanguage)
    } else {
      // Detect system language on first visit
      const systemLang = detectSystemLanguage()
      currentInterfaceLanguage = systemLang
      setInterfaceLanguage(currentInterfaceLanguage)
    }

    // 根据界面语言获取默认配置
    const languageConfig = getLanguageSpecificConfig(currentInterfaceLanguage)
    
    if (savedApiKey) {
      setApiKey(savedApiKey)
      setShowWelcome(false) // 如果有保存的API Key，不显示欢迎界面
    }
    
    // 如果没有保存的配置，使用基于语言的默认配置
    if (savedApiBaseUrl) {
      setApiBaseUrl(savedApiBaseUrl)
    } else {
      setApiBaseUrl(languageConfig.API_BASE_URL)
    }
    
    if (savedImageModel) {
      setImageModel(savedImageModel)
    } else {
      setImageModel(languageConfig.IMAGE_MODEL)
    }
    
    if (savedChatModel) {
      setChatModel(savedChatModel)
    } else {
      setChatModel(languageConfig.CHAT_MODEL)
    }
    
    if (savedEventBookModel) {
      setEventBookModel(savedEventBookModel)
    } else {
      setEventBookModel(languageConfig.EVENT_BOOK_MODEL)
    }
    
    if (savedLanguage) setLanguage(savedLanguage)
    if (savedCustomLanguage) setCustomLanguage(savedCustomLanguage)

    // 恢复角色数据
    if (savedCharacterData) {
      try {
        const parsedCharacterData = JSON.parse(savedCharacterData)
        setCharacterData(parsedCharacterData)
      } catch (error) {
        console.error("Failed to parse saved character data:", error)
      }
    }

    // 恢复版本数据
    if (savedVersions) {
      try {
        const parsedVersions = JSON.parse(savedVersions)
        // 恢复Date对象
        const versionsWithDates = parsedVersions.map((version: any) => ({
          ...version,
          timestamp: new Date(version.timestamp)
        }))
        setCharacterVersions(versionsWithDates)
      } catch (error) {
        console.error("Failed to parse saved versions:", error)
      }
    }

    if (savedCurrentVersionId) {
      setCurrentVersionId(savedCurrentVersionId)
    }

    // 恢复角色图片
    if (savedCharacterImage) {
      setCharacterImage(savedCharacterImage)
    }

    // 恢复聊天记录
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        // 恢复Date对象
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(messagesWithDates)
      } catch (error) {
        console.error("Failed to parse saved messages:", error)
      }
    }

    // 恢复事件书
    if (savedEventBook) {
      try {
        const parsedEventBook = JSON.parse(savedEventBook)
        setEventBook(parsedEventBook)
      } catch (error) {
        console.error("Failed to parse saved event book:", error)
      }
    }
  }, [])

  // 持久化角色数据
  useEffect(() => {
    localStorage.setItem("character-generator-character-data", JSON.stringify(characterData))
  }, [characterData])

  // 持久化角色图片
  useEffect(() => {
    localStorage.setItem("character-generator-character-image", characterImage)
  }, [characterImage])

  // 持久化聊天记录
  useEffect(() => {
    localStorage.setItem("character-generator-chat-messages", JSON.stringify(messages))
  }, [messages])

  // 持久化版本数据
  useEffect(() => {
    localStorage.setItem("character-generator-versions", JSON.stringify(characterVersions))
  }, [characterVersions])

  useEffect(() => {
    localStorage.setItem("character-generator-current-version-id", currentVersionId)
  }, [currentVersionId])

  // 持久化事件书数据
  useEffect(() => {
    if (eventBook) {
      localStorage.setItem("character-generator-event-book", JSON.stringify(eventBook))
    } else {
      localStorage.removeItem("character-generator-event-book")
    }
  }, [eventBook])







  // 保存设置到localStorage
  const saveSettings = () => {
    localStorage.setItem("character-generator-api-key", apiKey)
    localStorage.setItem("character-generator-api-base-url", apiBaseUrl)
    localStorage.setItem("character-generator-image-model", imageModel)
    localStorage.setItem("character-generator-chat-model", chatModel)
    localStorage.setItem("character-generator-event-book-model", eventBookModel)
    localStorage.setItem("character-generator-language", language)
    localStorage.setItem("character-generator-custom-language", customLanguage)
    localStorage.setItem("character-generator-interface-language", interfaceLanguage)
    setIsSettingsOpen(false)
  }

  // 清除设置
  const clearSettings = () => {
    if (confirm(t.clearSettingsConfirm)) {
      localStorage.removeItem("character-generator-api-key")
      localStorage.removeItem("character-generator-api-base-url")
      localStorage.removeItem("character-generator-image-model")
      localStorage.removeItem("character-generator-chat-model")
      localStorage.removeItem("character-generator-event-book-model")
      localStorage.removeItem("character-generator-language")
      localStorage.removeItem("character-generator-custom-language")
      localStorage.removeItem("character-generator-interface-language")
      
      // 重置为默认界面语言
      const defaultInterfaceLanguage = 'en'
      const languageConfig = getLanguageSpecificConfig(defaultInterfaceLanguage)
      
      setApiKey("")
      setApiBaseUrl(languageConfig.API_BASE_URL)
      setImageModel(languageConfig.IMAGE_MODEL)
      setChatModel(languageConfig.CHAT_MODEL)
      setEventBookModel(languageConfig.EVENT_BOOK_MODEL)
      setLanguage("en")
      setCustomLanguage("")
      setInterfaceLanguage(defaultInterfaceLanguage)
      setShowWelcome(true) // 清除设置后显示欢迎界面
    }
  }



  // 创建新版本
  const createNewVersion = (newData: Partial<TavernCardV2['data']>, label?: string) => {
    const maxVersion = characterVersions.length > 0 ? Math.max(...characterVersions.map(v => v.version)) : 0
    const newVersionNumber = maxVersion + 1
    
    const newVersion: CharacterVersion = {
      id: Date.now().toString(),
      version: newVersionNumber,
      data: {
        ...characterData.data,
        ...newData
      },
      timestamp: new Date(),
      label: label || (interfaceLanguage === 'zh' ? `AI生成 V${newVersionNumber}` : `AI Generated V${newVersionNumber}`)
    }

    setCharacterVersions(prev => [...prev, newVersion])
    setCurrentVersionId(newVersion.id)
    setCharacterData(prev => ({
      ...prev,
      data: newVersion.data
    }))

    return newVersion
  }

  // 切换到指定版本
  const switchToVersion = (versionId: string) => {
    const version = characterVersions.find(v => v.id === versionId)
    if (version) {
      setCurrentVersionId(versionId)
      setCharacterData(prev => ({
        ...prev,
        data: version.data
      }))
    }
  }

  // 获取当前版本信息
  const getCurrentVersion = () => {
    return characterVersions.find(v => v.id === currentVersionId)
  }

  // 显示属性更新提示
  const showAttributeUpdateNotification = (type: 'image-analysis' | 'ai-generation') => {
    const message = type === 'image-analysis' 
      ? (interfaceLanguage === 'zh' ? '图片分析完成，角色属性已更新' : 'Image analysis complete, character attributes updated')
      : (interfaceLanguage === 'zh' ? 'AI助手已生成新的角色属性' : 'AI assistant has generated new character attributes')
    
    // 检查是否为移动端
    if (window.innerWidth < 1024) { // lg断点
      setMobileAttributeUpdateNotification({
        show: true,
        message,
        type
      })
    } else {
      // 桌面端显示自动消失的toast（底部显示）
      toast({
        title: interfaceLanguage === 'zh' ? '属性已更新' : 'Attributes Updated',
        description: message,
        duration: 3000,
      })
    }
  }

  // 处理属性更新提示的确定按钮
  const handleAttributeUpdateConfirm = () => {
    setMobileAttributeUpdateNotification(prev => ({ ...prev, show: false }))
    setMobileActiveTab('attributes')
  }

  // 处理属性更新提示的取消按钮
  const handleAttributeUpdateCancel = () => {
    setMobileAttributeUpdateNotification(prev => ({ ...prev, show: false }))
  }

  // 尝试解析和应用JSON数据
  const tryApplyJsonData = (content: string) => {
    try {
      // 使用提取函数获取JSON内容
      const jsonString = extractJsonFromContent(content)
      const jsonData = JSON.parse(jsonString)

      // 检查是否有有效的更新数据
      const hasValidUpdate = jsonData.name || jsonData.description || jsonData.personality || 
                           jsonData.scenario || jsonData.first_mes || jsonData.mes_example || 
                           (jsonData.tags && Array.isArray(jsonData.tags)) || jsonData.character_book

      if (hasValidUpdate) {
        // 创建新版本而不是直接更新
        const updateData: Partial<TavernCardV2['data']> = {}
        if (jsonData.name) updateData.name = jsonData.name
        if (jsonData.description) updateData.description = jsonData.description
        if (jsonData.personality) updateData.personality = jsonData.personality
        if (jsonData.scenario) updateData.scenario = jsonData.scenario
        if (jsonData.first_mes) updateData.first_mes = jsonData.first_mes
        if (jsonData.mes_example) updateData.mes_example = jsonData.mes_example
        if (jsonData.tags && Array.isArray(jsonData.tags)) updateData.tags = jsonData.tags
        
        // 处理角色书数据
        if (jsonData.character_book && typeof jsonData.character_book === 'object') {
          updateData.character_book = jsonData.character_book
        }

        createNewVersion(updateData)
        
        // 显示属性更新提示
        showAttributeUpdateNotification('ai-generation')
        
        return true
      }
    } catch (error) {
      console.log("Failed to parse JSON from response:", error)
    }
    return false
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string
        setCharacterImage(imageDataUrl)

        // 分析图片内容
        if (apiKey) {
          await analyzeImage(imageDataUrl)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async (imageDataUrl: string) => {
    if (!apiKey) {
      alert(t.pleaseSetApiKey)
      return
    }

    setGlobalLoading({
      isLoading: true,
      status: t.analyzingImage,
      type: "image"
    })

    try {
      const prompts = getLanguagePrompts(language, customLanguage)

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageDataUrl,
          apiKey,
          apiBaseUrl,
          model: imageModel,
          prompt: prompts.imageAnalysis,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze image")
      }

      setGlobalLoading(prev => ({
        ...prev,
        status: t.processingCharacterData
      }))
      const analysis = await response.json()

      // 创建第一个版本（图像分析版本）
      const updateData: Partial<TavernCardV2['data']> = {}
      if (analysis.name) updateData.name = analysis.name
      if (analysis.description) updateData.description = analysis.description
      if (analysis.personality) updateData.personality = analysis.personality
      if (analysis.scenario) updateData.scenario = analysis.scenario
      if (analysis.first_mes) updateData.first_mes = analysis.first_mes
      if (analysis.mes_example) updateData.mes_example = analysis.mes_example
      if (analysis.tags && Array.isArray(analysis.tags)) updateData.tags = analysis.tags
      
      // 处理角色书数据
      if (analysis.character_book && typeof analysis.character_book === 'object') {
        updateData.character_book = analysis.character_book
      }

      createNewVersion(updateData, interfaceLanguage === 'zh' ? '图像分析 V1' : 'Image Analysis V1')

      setGlobalLoading(prev => ({
        ...prev,
        status: t.characterGeneratedSuccessfully
      }))
      
      // 显示属性更新提示
      setTimeout(() => {
        setGlobalLoading({
          isLoading: false,
          status: "",
          type: ""
        })
        
        showAttributeUpdateNotification('image-analysis')
      }, 2000)
      
    } catch (error) {
      console.error("Error analyzing image:", error)
      setGlobalLoading(prev => ({
        ...prev,
        status: t.failedToAnalyzeImage
      }))
      setTimeout(() => setGlobalLoading({
        isLoading: false,
        status: "",
        type: ""
      }), 3000)
      alert(t.failedToAnalyzeImageMessage)
    }
  }

  const updateCharacterField = (field: string, value: any) => {
    setCharacterData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
    }))
  }

  // 更新角色书
  const updateCharacterBook = (book?: CharacterBook) => {
    setCharacterData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        character_book: book,
      },
    }))
  }

  const addAlternateGreeting = () => {
    updateCharacterField("alternate_greetings", [...characterData.data.alternate_greetings, ""])
  }

  const updateAlternateGreeting = (index: number, value: string) => {
    const newGreetings = [...characterData.data.alternate_greetings]
    newGreetings[index] = value
    updateCharacterField("alternate_greetings", newGreetings)
  }

  const removeAlternateGreeting = (index: number) => {
    const newGreetings = characterData.data.alternate_greetings.filter((_, i) => i !== index)
    updateCharacterField("alternate_greetings", newGreetings)
  }

  const addTag = () => {
    const newTag = prompt(t.enterNewTag)
    if (newTag && newTag.trim()) {
      updateCharacterField("tags", [...characterData.data.tags, newTag.trim()])
    }
  }

  const removeTag = (index: number) => {
    const newTags = characterData.data.tags.filter((_, i) => i !== index)
    updateCharacterField("tags", newTags)
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !apiKey) {
      if (!apiKey) {
        alert(t.pleaseSetApiKey)
      }
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    }

    // Add user message
    setMessages((prev) => [...prev, userMessage])
    setChatInput("")
    setIsChatLoading(true)
    setStreamingContent("")

    try {
      const prompts = getLanguagePrompts(language, customLanguage)
      const systemPrompt = prompts.chatSystem.replace("{characterData}", JSON.stringify(characterData.data, null, 2))

      // 开始流式请求
      const response = await fetch("/api/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            {
              role: "user",
              content: chatInput,
            },
          ],
          apiKey,
          apiBaseUrl,
          model: chatModel,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      if (!response.body) {
        throw new Error("Response body is null")
      }

      // 处理流式响应
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        fullContent += chunk
        setStreamingContent(fullContent)
      }

      // 流式输出完成，添加到消息列表
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: fullContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setStreamingContent("")

      // 尝试解析并应用JSON数据
      tryApplyJsonData(fullContent)

    } catch (error) {
      console.error("Error:", error)
      alert(t.failedToGetAiResponse)
    } finally {
      setIsChatLoading(false)
    }
  }

  const clearChat = () => {
    if (messages.length > 0 && !confirm(t.clearChatConfirm)) {
      return
    }
    setMessages([])
    setStreamingContent("")
  }

  const openExportDialog = () => {
    setIsExportDialogOpen(true)
  }

  const exportAsJson = () => {
    const dataStr = JSON.stringify(characterData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${characterData.data.name || "character"}.json`
    link.click()
    URL.revokeObjectURL(url)
    setIsExportDialogOpen(false)
  }

  const exportAsPng = async () => {
    try {
      if (!characterImage || characterImage.includes("placeholder.svg")) {
        alert(interfaceLanguage === 'zh' ? "请先上传一张图片" : "Please upload an image first")
        return
      }

      // 创建一个Image对象来加载原始图片
      const img = new window.Image()
      img.crossOrigin = "anonymous" // 处理跨域问题
      
      const imageLoadPromise = new Promise<HTMLCanvasElement>((resolve, reject) => {
        img.onload = () => {
          // 创建Canvas来将图片转换为PNG格式
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('无法创建Canvas上下文'))
            return
          }

          // 设置Canvas尺寸与原图相同
          canvas.width = img.width
          canvas.height = img.height
          
          // 在Canvas上绘制图片
          ctx.drawImage(img, 0, 0)
          
          resolve(canvas)
        }
        
        img.onerror = () => {
          reject(new Error('图片加载失败'))
        }
      })

      img.src = characterImage
      const canvas = await imageLoadPromise

      // 将Canvas转换为PNG格式的Blob
      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Canvas转换为PNG失败'))
          }
        }, 'image/png')
      })

      // 将PNG Blob转换为ArrayBuffer
      const pngArrayBuffer = await pngBlob.arrayBuffer()

      // 将角色数据转换为JSON字符串
      const cardData = JSON.stringify(characterData)

      // 使用Png.Generate生成带有角色卡数据的PNG
      const pngWithData = Png.Generate(pngArrayBuffer, cardData, { version: 'v2' })

      // 创建下载链接
      const dataBlob = new Blob([pngWithData], { type: "image/png" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${characterData.data.name || "character"}.png`
      link.click()
      URL.revokeObjectURL(url)
      setIsExportDialogOpen(false)
    } catch (error) {
      console.error('PNG export failed:', error)
      alert('PNG导出失败: ' + (error as Error).message)
    }
  }

  // 检查是否已上传图片（不是默认placeholder）或者已跳过图片上传
  const hasUploadedImage = (characterImage && !characterImage.includes("placeholder.svg")) || hasSkippedImageUpload



  // 打开事件书编辑器
  const openEventBookEditor = () => {
    if (eventBook) {
      setEventBookJsonText(JSON.stringify(eventBook, null, 2))
      setIsEventBookEditorOpen(true)
    }
  }

  // 保存事件书编辑
  const saveEventBookEdit = () => {
    try {
      const parsedEventBook = JSON.parse(eventBookJsonText)
      // 简单验证
      if (parsedEventBook.id && parsedEventBook.meta && parsedEventBook.events) {
        setEventBook(parsedEventBook)
        setIsEventBookEditorOpen(false)
        alert(interfaceLanguage === 'zh' ? '事件书保存成功！' : 'Event book saved successfully!')
      } else {
        throw new Error('Invalid event book structure')
      }
    } catch (error) {
      alert(interfaceLanguage === 'zh' ? 'JSON格式错误，请检查语法' : 'JSON format error, please check syntax')
    }
  }

  // 删除事件书
  const deleteEventBook = () => {
    if (confirm(interfaceLanguage === 'zh' ? '确定要删除事件书吗？' : 'Are you sure you want to delete the event book?')) {
      setEventBook(null)
      setEventBookJsonText("")
    }
  }

  // 下载事件书
  const downloadEventBook = () => {
    if (!eventBook) return
    
    const dataStr = JSON.stringify(eventBook, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    
    // 生成文件名：优先使用事件书名称，其次使用角色名称，最后使用默认名称
    const fileName = eventBook.meta.name 
      ? `${eventBook.meta.name}.json`
      : characterData.data.name 
        ? `${characterData.data.name}_事件书.json`
        : 'eventbook.json'
    
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  // 创建新角色
  const createNewCharacter = () => {
    if (confirm(interfaceLanguage === 'zh' ? '确定要创建新角色吗？当前角色的所有数据（包括图片、属性、聊天记录和事件书）将被清空。' : 'Are you sure you want to create a new character? All current character data (including image, attributes, chat history, and event book) will be cleared.')) {
      // 重置角色数据
      setCharacterData({
        spec: "chara_card_v2",
        spec_version: "2.0",
        data: {
          name: "",
          description: "",
          personality: "",
          scenario: "",
          first_mes: "",
          mes_example: "",
          creator_notes: "",
          system_prompt: "",
          post_history_instructions: "",
          alternate_greetings: [],
          character_book: undefined,
          tags: [],
          creator: "",
          character_version: "1.0",
          extensions: {},
        },
      })
      
      // 重置图片
      setCharacterImage("/placeholder.svg?height=400&width=300")
      
      // 清空聊天记录
      setMessages([])
      setStreamingContent("")
      setChatInput("")
      
      // 清空版本数据
      setCharacterVersions([])
      setCurrentVersionId("")
      
      // 清空事件书
      setEventBook(null)
      setEventBookJsonText("")
      
      // 清空对应的localStorage
      localStorage.removeItem("character-generator-character-data")
      localStorage.removeItem("character-generator-character-image")
      localStorage.removeItem("character-generator-chat-messages")
      localStorage.removeItem("character-generator-versions")
      localStorage.removeItem("character-generator-current-version-id")
      localStorage.removeItem("character-generator-event-book")
      
      // 重置跳过状态
      setHasSkippedImageUpload(false)
    }
  }

  // 从Google Drive加载角色数据
  const handleLoadCharacterData = (loadedData: TavernCardV2, loadedImage?: string, loadedMessages?: any[]) => {
    setCharacterData(loadedData)
    
    // 恢复图片
    if (loadedImage) {
      setCharacterImage(loadedImage)
    } else {
      // 如果没有保存的图片，使用默认图片
      setCharacterImage("/placeholder.svg?height=400&width=300")
    }
    
    // 恢复聊天记录
    if (loadedMessages && loadedMessages.length > 0) {
      // 确保消息有正确的时间戳格式
      const messagesWithDates = loadedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
      setMessages(messagesWithDates)
    } else {
      setMessages([])
    }
    
    // 清空当前版本历史和事件书，因为这是新加载的角色
    setCharacterVersions([])
    setCurrentVersionId("")
    setStreamingContent("")
    setChatInput("")
    setEventBook(null)
    setEventBookJsonText("")
    
    // 清空对应的localStorage中的版本和事件书数据
    localStorage.removeItem("character-generator-versions")
    localStorage.removeItem("character-generator-current-version-id")
    localStorage.removeItem("character-generator-event-book")
    
    toast({
      title: interfaceLanguage === 'zh' ? '加载成功' : 'Loaded Successfully',
      description: interfaceLanguage === 'zh' 
        ? `已加载 ${loadedData.data.name || '角色'}，包含${loadedMessages?.length || 0}条聊天记录` 
        : `Loaded ${loadedData.data.name || 'Character'} with ${loadedMessages?.length || 0} chat messages`,
    })
  }

  // 应用调整方案
  const applyAdjustmentPreset = (content: string) => {
    setChatInput(content)
  }

  // 手动保存为新版本
  const saveAsNewVersion = () => {
    const customName = prompt(t.enterVersionName)
    const label = customName?.trim() || (interfaceLanguage === 'zh' ? '手动保存' : 'Manual Save')
    createNewVersion({}, label)
  }

  // 重新生成最后一条AI消息
  const regenerateLastMessage = async () => {
    if (messages.length < 2 || !apiKey) {
      return
    }

    // 找到最后一条用户消息
    let lastUserMessage = null
    let lastUserIndex = -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserMessage = messages[i]
        lastUserIndex = i
        break
      }
    }

    if (!lastUserMessage) return

    // 移除最后一条AI回复
    const messagesUntilLastUser = messages.slice(0, lastUserIndex + 1)
    setMessages(messagesUntilLastUser)
    setIsChatLoading(true)
    setStreamingContent("")

    try {
      const prompts = getLanguagePrompts(language, customLanguage)
      const systemPrompt = prompts.chatSystem.replace("{characterData}", JSON.stringify(characterData.data, null, 2))

      const response = await fetch("/api/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            ...messagesUntilLastUser.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
          apiKey,
          apiBaseUrl,
          model: chatModel,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      if (!response.body) {
        throw new Error("Response body is null")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        fullContent += chunk
        setStreamingContent(fullContent)
      }

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: fullContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setStreamingContent("")
      tryApplyJsonData(fullContent)

    } catch (error) {
      console.error("Error:", error)
      alert(t.failedToGetAiResponse)
    } finally {
      setIsChatLoading(false)
    }
  }

  // 生成事件书提示词
  const generateEventBookPrompt = (customEventCount?: number, customBackground?: string) => {
    const eventCount = customEventCount || Math.max(3, Math.min(99, eventBookCount))
    const backgroundInfo = (customBackground || eventBookBackground).trim() ? 
      (interfaceLanguage === 'zh' ? `\n\n背景故事概要：${customBackground || eventBookBackground}` : `\n\nBackground Story: ${customBackground || eventBookBackground}`) : 
      ''

    // 生成事件编号序列
    const eventNumbers = Array.from({ length: eventCount }, (_, i) => (i + 1) * 10).join(', ')

    return interfaceLanguage === 'zh' ? 
      `基于以下角色信息，为角色设计一个包含${eventCount}个事件的背景故事事件书。角色信息：

名字：${characterData.data.name}
描述：${characterData.data.description}
性格：${characterData.data.personality}
场景：${characterData.data.scenario}${backgroundInfo}

请根据角色的设定，设计${eventCount}个有趣且连贯的事件，这些事件应该能够展现角色的成长、冒险或重要经历。事件应该按照时间顺序排列，并且彼此之间有一定的关联性。

请严格按照以下JSON格式输出，不要添加任何额外的文字或说明：

{
  "id": "随机UUID",
  "meta": {
    "name": "事件书名称",
    "author": "AI生成",
    "author_link": "",
    "desp": "事件书的详细描述"
  },
  "events": [
    {
      "id": "随机UUID",
      "number": 10,
      "title": "事件标题",
      "desp": "事件详细描述，使用 {{user}} 代指用户，{{char}}} 代指角色",
      "unlockType": "none",
      "unlockCondition": "",
      "completeType": "none",
      "compeletCondition": ""
    }
  ]
}

编号按10递增（${eventNumbers}）。在事件描述中，使用 {{user}} 代指用户，{{char}}} 代指角色名。` :
      `Based on the following character information, design a background story event book containing ${eventCount} events for the character. Character information:

Name: ${characterData.data.name}
Description: ${characterData.data.description}
Personality: ${characterData.data.personality}
Scenario: ${characterData.data.scenario}${backgroundInfo}

Please design ${eventCount} interesting and coherent events based on the character's settings. These events should showcase the character's growth, adventures, or important experiences. Events should be arranged in chronological order and have some correlation with each other.

Please output strictly in the following JSON format without any additional text or explanation:

{
  "id": "random UUID",
  "meta": {
    "name": "Event book name",
    "author": "AI Generated",
    "author_link": "",
    "desp": "Detailed description of the event book"
  },
  "events": [
    {
      "id": "random UUID",
      "number": 10,
      "title": "Event title",
      "desp": "Detailed event description, use {{user}} for user, {{char}} for character",
      "unlockType": "none",
      "unlockCondition": "",
      "completeType": "none",
      "compeletCondition": ""
    }
  ]
}

Numbers increment by 10 (${eventNumbers}). In event descriptions, use {{user}} for user and {{char}} for character name.`
  }

  // 复制事件书提示词到剪贴板
  const copyEventBookPrompt = async () => {
    if (!characterData.data.name || !characterData.data.description || !characterData.data.personality) {
      alert(interfaceLanguage === 'zh' ? '请先完善角色的基本信息（名字、描述、性格）' : 'Please complete the character\'s basic information (name, description, personality) first')
      return
    }

    const prompt = generateEventBookPrompt()

    // 尝试现代 clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(prompt)
        alert(interfaceLanguage === 'zh' ? '提示词已复制到剪贴板！' : 'Prompt copied to clipboard!')
        return
      } catch (error) {
        console.error('Modern clipboard API failed:', error)
      }
    }

    // 降级到传统方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = prompt
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        alert(interfaceLanguage === 'zh' ? '提示词已复制到剪贴板！' : 'Prompt copied to clipboard!')
      } else {
        throw new Error('execCommand failed')
      }
    } catch (error) {
      console.error('Fallback copy method failed:', error)
      
      // 最后的降级方案：在控制台显示完整内容供复制
      console.log('==================== 事件书提示词 / Event Book Prompt ====================')
      console.log(prompt)
      console.log('==================================================================')
      
      alert(interfaceLanguage === 'zh' 
        ? '无法自动复制到剪贴板，完整提示词已输出到浏览器控制台（F12打开开发者工具查看）' 
        : 'Cannot copy to clipboard automatically. Full prompt has been output to browser console (press F12 to open developer tools)')
    }
  }

  // 生成事件书（带背景故事）
  const generateEventBookWithBackground = async () => {
    if (!apiKey) {
      alert(t.pleaseSetApiKey)
      return
    }

    if (!characterData.data.name || !characterData.data.description || !characterData.data.personality) {
      alert(interfaceLanguage === 'zh' ? '请先完善角色的基本信息（名字、描述、性格）' : 'Please complete the character\'s basic information (name, description, personality) first')
      return
    }

    // 验证事件数量
    const eventCount = Math.max(3, Math.min(99, eventBookCount))
    if (eventCount !== eventBookCount) {
      setEventBookCount(eventCount)
    }

    setIsGeneratingEventBook(true)
    setIsEventBookDialogOpen(false)

    try {
      const eventBookPrompt = generateEventBookPrompt(eventCount, eventBookBackground)

      const response = await fetch("/api/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: eventBookPrompt,
            },
          ],
          apiKey,
          apiBaseUrl,
          model: eventBookModel,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate event book")
      }

      if (!response.body) {
        throw new Error("Response body is null")
      }

      // 处理流式响应
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        fullContent += chunk
      }

      // 尝试解析JSON
      try {
        const jsonString = extractJsonFromContent(fullContent)
        const eventBookData = JSON.parse(jsonString)
        
        // 验证数据结构
        if (eventBookData.id && eventBookData.meta && eventBookData.events) {
          setEventBook(eventBookData)
          setEventBookBackground("") // 清空背景故事输入
          setEventBookCount(5) // 重置事件数量
          alert(interfaceLanguage === 'zh' ? '事件书生成成功！' : 'Event book generated successfully!')
        } else {
          throw new Error('Invalid event book structure')
        }
      } catch (error) {
        console.error("Failed to parse event book JSON:", error)
        alert(interfaceLanguage === 'zh' ? '事件书生成失败，请重试' : 'Failed to generate event book, please try again')
      }

    } catch (error) {
      console.error("Error generating event book:", error)
      alert(interfaceLanguage === 'zh' ? '事件书生成失败，请检查网络连接后重试' : 'Failed to generate event book, please check your network connection and try again')
    } finally {
      setIsGeneratingEventBook(false)
    }
  }

  // 打开事件书生成对话框
  const openEventBookDialog = () => {
    setIsEventBookDialogOpen(true)
  }

  // 获取主题图标
  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return <Sun className="w-4 h-4" />
      case 'dark':
        return <Moon className="w-4 h-4" />
      case 'system':
        return <Monitor className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  // 获取主题显示名称
  const getThemeLabel = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return interfaceLanguage === 'zh' ? '浅色模式' : 'Light Mode'
      case 'dark':
        return interfaceLanguage === 'zh' ? '深色模式' : 'Dark Mode'
      case 'system':
        return interfaceLanguage === 'zh' ? '跟随系统' : 'Follow System'
      default:
        return interfaceLanguage === 'zh' ? '跟随系统' : 'Follow System'
    }
  }

  // 处理图片上传页面的返回操作
  const handleImageUploadGoBack = () => {
    // 清空API Key，这样会回到欢迎页面
    setApiKey("")
    localStorage.removeItem("character-generator-api-key")
    setShowWelcome(true)
    setHasSkippedImageUpload(false) // 重置跳过状态
  }

  // 处理图片上传页面的跳过操作
  const handleImageUploadSkip = () => {
    // 设置跳过标记，让用户可以进入完整界面
    setHasSkippedImageUpload(true)
  }

  // 如果还没挂载完成，显示加载状态
  if (!mounted) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header - 只在桌面端显示 */}
      <div className="hidden lg:block flex-shrink-0 p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.128.png" 
              alt="AIRole.net Logo" 
              width={32} 
              height={32} 
              className="w-8 h-8 rounded"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground text-red-600">AIRole.net</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {/* 只有在有图片时才显示导出和新角色按钮 */}
            {hasUploadedImage && (
              <>
                <Button onClick={openExportDialog} variant="outline" size="sm" className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  {t.export}
                </Button>
                <Button onClick={createNewCharacter} variant="outline" size="sm" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  {interfaceLanguage === 'zh' ? '新角色' : 'New Character'}
                </Button>
              </>
            )}
            <GoogleDriveManager
              interfaceLanguage={interfaceLanguage}
              characterData={characterData}
              characterImage={characterImage}
              chatMessages={messages}
              onLoadCharacterData={handleLoadCharacterData}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  {getThemeIcon(theme || 'system')}
                  <span className="ml-2 hidden sm:inline">
                    {interfaceLanguage === 'zh' ? '主题' : 'Theme'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="w-4 h-4 mr-2" />
                  {interfaceLanguage === 'zh' ? '浅色模式' : 'Light Mode'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="w-4 h-4 mr-2" />
                  {interfaceLanguage === 'zh' ? '深色模式' : 'Dark Mode'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="w-4 h-4 mr-2" />
                  {interfaceLanguage === 'zh' ? '跟随系统' : 'Follow System'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              {t.settings}
            </Button>
          </div>
        </div>
      </div>

      {/* 条件渲染：优先引导用户完成关键步骤 */}
      {showWelcome ? (
        <WelcomeScreen 
          interfaceLanguage={interfaceLanguage}
          setInterfaceLanguage={(newLang: 'zh' | 'en') => {
            // 当界面语言改变时，自动更新相关配置（如果当前是默认配置的话）
            const oldConfig = getLanguageSpecificConfig(interfaceLanguage)
            const newConfig = getLanguageSpecificConfig(newLang)
            
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
            
            setInterfaceLanguage(newLang)
          }}
          apiKey={apiKey}
          setApiKey={setApiKey}
          apiBaseUrl={apiBaseUrl}
          setApiBaseUrl={setApiBaseUrl}
          imageModel={imageModel}
          setImageModel={setImageModel}
          chatModel={chatModel}
          setChatModel={setChatModel}
          eventBookModel={eventBookModel}
          setEventBookModel={setEventBookModel}
          language={language}
          setLanguage={setLanguage}
          customLanguage={customLanguage}
          setCustomLanguage={setCustomLanguage}
          onContinue={() => setShowWelcome(false)}
        />
      ) : !hasUploadedImage && !hasSkippedImageUpload ? (
        <CharacterImageUpload
          interfaceLanguage={interfaceLanguage}
          characterImage={characterImage}
          onImageUpload={handleImageUpload}
          globalLoading={globalLoading}
          onGoBack={handleImageUploadGoBack}
          onSkip={handleImageUploadSkip}
        />
      ) : (
        // 第三步：完整界面 - 响应式布局
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* 桌面端：三列布局 */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-4 px-4 pb-4 h-full">
            {/* Column 1: Character Image */}
            <div className="flex flex-col min-h-0 max-h-full">
              <Card className="flex-1 flex flex-col min-h-0 max-h-full">
                <CardHeader className="flex-shrink-0">
                  <CardTitle>{t.characterImage}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-4 overflow-y-auto min-h-0">
                  <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={characterImage || "/placeholder.svg"}
                      alt="Character"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex-shrink-0"
                    variant="outline"
                    disabled={globalLoading.isLoading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t.uploadImage}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Column 2: Character Attributes */}
            <div className="flex flex-col min-h-0 max-h-full">
              <Card className="flex-1 flex flex-col min-h-0 max-h-full">
                <CardHeader className="flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <CardTitle>{t.characterAttributes}</CardTitle>
                    {/* 版本选择器 */}
                    <VersionHistoryDialog
                      interfaceLanguage={interfaceLanguage}
                      isOpen={isVersionSelectorOpen}
                      onOpenChange={setIsVersionSelectorOpen}
                      characterVersions={characterVersions}
                      currentVersionId={currentVersionId}
                      getCurrentVersion={getCurrentVersion}
                      onSaveAsNewVersion={saveAsNewVersion}
                      onSwitchToVersion={switchToVersion}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto min-h-0">
                  <Tabs defaultValue="basic" className="w-full h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
                      <TabsTrigger value="basic">{t.basic}</TabsTrigger>
                      <TabsTrigger value="advanced">{t.advanced}</TabsTrigger>
                      <TabsTrigger value="meta">{t.meta}</TabsTrigger>
                      <TabsTrigger value="character-book">
                        {interfaceLanguage === 'zh' ? '角色书' : 'Book'}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 flex-1 overflow-y-auto">
                      <div>
                        <Label htmlFor="name">{t.name}</Label>
                        <Input
                          id="name"
                          value={characterData.data.name}
                          onChange={(e) => updateCharacterField("name", e.target.value)}
                          placeholder={t.placeholders.characterName}
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">{t.description}</Label>
                        <Textarea
                          id="description"
                          value={characterData.data.description}
                          onChange={(e) => updateCharacterField("description", e.target.value)}
                          placeholder={t.placeholders.characterDescription}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="personality">{t.personality}</Label>
                        <Textarea
                          id="personality"
                          value={characterData.data.personality}
                          onChange={(e) => updateCharacterField("personality", e.target.value)}
                          placeholder={t.placeholders.personalityTraits}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="scenario">{t.scenario}</Label>
                        <Textarea
                          id="scenario"
                          value={characterData.data.scenario}
                          onChange={(e) => updateCharacterField("scenario", e.target.value)}
                          placeholder={t.placeholders.initialScenario}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="first_mes">{t.firstMessage}</Label>
                        <Textarea
                          id="first_mes"
                          value={characterData.data.first_mes}
                          onChange={(e) => updateCharacterField("first_mes", e.target.value)}
                          placeholder={t.placeholders.firstMessage}
                          rows={3}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-4 flex-1 overflow-y-auto">
                      <div>
                        <Label htmlFor="mes_example">{t.messageExample}</Label>
                        <Textarea
                          id="mes_example"
                          value={characterData.data.mes_example}
                          onChange={(e) => updateCharacterField("mes_example", e.target.value)}
                          placeholder={t.placeholders.exampleConversation}
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="system_prompt">{t.systemPrompt}</Label>
                        <Textarea
                          id="system_prompt"
                          value={characterData.data.system_prompt}
                          onChange={(e) => updateCharacterField("system_prompt", e.target.value)}
                          placeholder={t.placeholders.systemInstructions}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="post_history_instructions">{t.postHistoryInstructions}</Label>
                        <Textarea
                          id="post_history_instructions"
                          value={characterData.data.post_history_instructions}
                          onChange={(e) => updateCharacterField("post_history_instructions", e.target.value)}
                          placeholder={t.placeholders.postHistoryInstructions}
                          rows={3}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>{t.alternateGreetings}</Label>
                          <Button onClick={addAlternateGreeting} size="sm" variant="outline">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        {characterData.data.alternate_greetings.map((greeting, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <Textarea
                              value={greeting}
                              onChange={(e) => updateAlternateGreeting(index, e.target.value)}
                              placeholder={t.placeholders.alternateGreeting}
                              rows={2}
                            />
                            <Button onClick={() => removeAlternateGreeting(index)} size="sm" variant="destructive">
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="meta" className="space-y-4 flex-1 overflow-y-auto">
                      <div>
                        <Label htmlFor="creator">{t.creator}</Label>
                        <Input
                          id="creator"
                          value={characterData.data.creator}
                          onChange={(e) => updateCharacterField("creator", e.target.value)}
                          placeholder={t.placeholders.creatorName}
                        />
                      </div>

                      <div>
                        <Label htmlFor="character_version">{t.characterVersion}</Label>
                        <Input
                          id="character_version"
                          value={characterData.data.character_version}
                          onChange={(e) => updateCharacterField("character_version", e.target.value)}
                          placeholder="1.0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="creator_notes">{t.creatorNotes}</Label>
                        <Textarea
                          id="creator_notes"
                          value={characterData.data.creator_notes}
                          onChange={(e) => updateCharacterField("creator_notes", e.target.value)}
                          placeholder={t.placeholders.notesForUsers}
                          rows={3}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>{t.tags}</Label>
                          <Button onClick={addTag} size="sm" variant="outline">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {characterData.data.tags.map((tag, index) => (
                            <div
                              key={index}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                            >
                              {tag}
                              <button onClick={() => removeTag(index)} className="text-blue-600 hover:text-blue-800">
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 事件书段落 - 只在功能开关开启时显示 */}
                      {FEATURE_FLAGS.SHOW_EVENT_BOOK && (
                        <div className="border-t pt-4">
                          <div className="mb-2">
                            <Label className="text-base font-medium">
                              {interfaceLanguage === 'zh' ? '事件书' : 'Event Book'}
                            </Label>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-3">
                            {interfaceLanguage === 'zh' 
                              ? '事件书可以将一系列事件串联起来，让用户体验连续剧情。此内容不会包含在角色卡导出中。' 
                              : 'Event books link a series of events together, allowing users to experience continuous storylines. This content will not be included in character card exports.'}
                          </div>

                          {eventBook ? (
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 dark:bg-gray-800 dark:text-gray-400">
                              <div className="font-medium text-sm">{eventBook.meta.name}</div>
                              <div className="text-xs text-gray-600">{eventBook.meta.desp}</div>
                              <div className="text-xs text-gray-500">
                                {interfaceLanguage === 'zh' ? '事件数量：' : 'Events: '}{eventBook.events.length}
                              </div>
                              <div className="text-xs text-gray-500">
                                {interfaceLanguage === 'zh' ? '事件编号：' : 'Event numbers: '}
                                {eventBook.events.map(e => e.number).join(', ')}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm dark:bg-gray-800 dark:text-gray-400">
                              {interfaceLanguage === 'zh' 
                                ? '暂无事件书，点击"生成事件书"根据角色设定创建背景故事' 
                                : 'No event book yet, click "Generate Event Book" to create a background story based on character settings'}
                            </div>
                          )}

                          {/* 事件书操作按钮 */}
                          <div className="flex gap-2 flex-wrap pt-3">
                            <Button 
                              onClick={copyEventBookPrompt} 
                              size="sm" 
                              variant="outline"
                              className="text-xs"
                            >
                              {interfaceLanguage === 'zh' ? '复制提示词' : 'Copy Prompt'}
                            </Button>
                            {!eventBook ? (
                              <Button 
                                onClick={openEventBookDialog} 
                                size="sm" 
                                variant="outline"
                                disabled={isGeneratingEventBook}
                              >
                                {isGeneratingEventBook ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
                                    {interfaceLanguage === 'zh' ? '生成中...' : 'Generating...'}
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4 mr-1" />
                                    {interfaceLanguage === 'zh' ? '生成事件书' : 'Generate Event Book'}
                                  </>
                                )}
                              </Button>
                            ) : (
                              <>
                                <Button onClick={openEventBookEditor} size="sm" variant="outline">
                                  {interfaceLanguage === 'zh' ? '编辑' : 'Edit'}
                                </Button>
                                <Button onClick={downloadEventBook} size="sm" variant="outline">
                                  {/* <Download className="w-4 h-4 mr-1" /> */}
                                  {interfaceLanguage === 'zh' ? '下载' : 'Download'}
                                </Button>
                                <Button onClick={deleteEventBook} size="sm" variant="destructive">
                                  {interfaceLanguage === 'zh' ? '删除' : 'Delete'}
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="character-book" className="flex-1 overflow-y-auto">
                      <CharacterBookManager
                        characterBook={characterData.data.character_book}
                        onUpdateCharacterBook={updateCharacterBook}
                        interfaceLanguage={interfaceLanguage}
                        t={t}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Column 3: Chat Window */}
            <ChatWindow
              interfaceLanguage={interfaceLanguage}
              t={t}
              messages={messages}
              streamingContent={streamingContent}
              isChatLoading={isChatLoading}
              chatInput={chatInput}
              setChatInput={setChatInput}
              onSendMessage={sendChatMessage}
              onClearChat={clearChat}
              onRegenerateLastMessage={regenerateLastMessage}
              adjustmentPresets={getAdjustmentPresets()}
              onApplyPreset={applyAdjustmentPreset}
            />
          </div>

          {/* 移动端：Tab切换布局 */}
          <div className="lg:hidden flex flex-col h-full">
            {/* 移动端属性更新提示 */}
            {mobileAttributeUpdateNotification.show && (
              <div className="fixed top-4 left-4 right-4 z-50">
                <Alert className="bg-background border shadow-lg">
                  <AlertDescription className="flex items-center justify-between">
                    <span className="text-foreground flex-1">
                      {mobileAttributeUpdateNotification.message}
                    </span>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleAttributeUpdateCancel}
                        className="h-8 px-3"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleAttributeUpdateConfirm}
                        className="h-8 px-3"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {interfaceLanguage === 'zh' ? '查看' : 'View'}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* 移动端Tab导航 */}
            <div className="flex-shrink-0 px-4 pb-2 pt-4">
              <div className="flex items-center gap-2">
                {/* Tab选择器 */}
                <div className="flex bg-muted/30 rounded-lg p-1 flex-1">
                  <button
                    onClick={() => setMobileActiveTab('image')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      mobileActiveTab === 'image'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {interfaceLanguage === 'zh' ? '图片' : 'Image'}
                  </button>
                  <button
                    onClick={() => setMobileActiveTab('attributes')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      mobileActiveTab === 'attributes'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {interfaceLanguage === 'zh' ? '属性' : 'Attributes'}
                  </button>
                  <button
                    onClick={() => setMobileActiveTab('chat')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      mobileActiveTab === 'chat'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {interfaceLanguage === 'zh' ? '聊天' : 'Chat'}
                  </button>
                </div>
                
                {/* 右侧按钮组 */}
                <div className="flex gap-1">
                  {/* 导出按钮 - 只在有角色内容时显示 */}
                  {hasUploadedImage && (
                    <Button
                      onClick={openExportDialog}
                      variant="outline"
                      size="sm"
                      className="px-2"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {/* 更多按钮 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="px-2">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {hasUploadedImage && (
                        <>
                          <DropdownMenuItem onClick={createNewCharacter}>
                            <Plus className="w-4 h-4 mr-2" />
                            {interfaceLanguage === 'zh' ? '新角色' : 'New Character'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                                              <GoogleDriveManager
                          interfaceLanguage={interfaceLanguage}
                          characterData={characterData}
                          characterImage={characterImage}
                          chatMessages={messages}
                          onLoadCharacterData={handleLoadCharacterData}
                        />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                        <Settings className="w-4 h-4 mr-2" />
                        {t.settings}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          {getThemeIcon(theme || 'system')}
                          <span className="ml-2">
                            {interfaceLanguage === 'zh' ? '主题' : 'Theme'}
                          </span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => setTheme('light')}>
                            <Sun className="w-4 h-4 mr-2" />
                            {interfaceLanguage === 'zh' ? '浅色模式' : 'Light Mode'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme('dark')}>
                            <Moon className="w-4 h-4 mr-2" />
                            {interfaceLanguage === 'zh' ? '深色模式' : 'Dark Mode'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme('system')}>
                            <Monitor className="w-4 h-4 mr-2" />
                            {interfaceLanguage === 'zh' ? '跟随系统' : 'Follow System'}
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* 移动端Tab内容 */}
            <div className="flex-1 px-4 pb-4 min-h-0 overflow-hidden">
              {/* Character Image Tab */}
              {mobileActiveTab === 'image' && (
                <Card className="h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <CardTitle>{t.characterImage}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-4 overflow-y-auto">
                    <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={characterImage || "/placeholder.svg"}
                        alt="Character"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex-shrink-0"
                      variant="outline"
                      disabled={globalLoading.isLoading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {t.uploadImage}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Character Attributes Tab */}
              {mobileActiveTab === 'attributes' && (
                <Card className="h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex justify-between items-center">
                      <CardTitle>{t.characterAttributes}</CardTitle>
                      <VersionHistoryDialog
                        interfaceLanguage={interfaceLanguage}
                        isOpen={isVersionSelectorOpen}
                        onOpenChange={setIsVersionSelectorOpen}
                        characterVersions={characterVersions}
                        currentVersionId={currentVersionId}
                        getCurrentVersion={getCurrentVersion}
                        onSaveAsNewVersion={saveAsNewVersion}
                        onSwitchToVersion={switchToVersion}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto">
                    <Tabs defaultValue="basic" className="w-full h-full flex flex-col">
                      <TabsList className="grid w-full grid-cols-4 flex-shrink-0 text-xs">
                        <TabsTrigger value="basic">{t.basic}</TabsTrigger>
                        <TabsTrigger value="advanced">{t.advanced}</TabsTrigger>
                        <TabsTrigger value="meta">{t.meta}</TabsTrigger>
                        <TabsTrigger value="character-book">
                          {interfaceLanguage === 'zh' ? '角色书' : 'Book'}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="basic" className="space-y-4 flex-1 overflow-y-auto">
                        <div>
                          <Label htmlFor="mobile-name">{t.name}</Label>
                          <Input
                            id="mobile-name"
                            value={characterData.data.name}
                            onChange={(e) => updateCharacterField("name", e.target.value)}
                            placeholder={t.placeholders.characterName}
                          />
                        </div>

                        <div>
                          <Label htmlFor="mobile-description">{t.description}</Label>
                          <Textarea
                            id="mobile-description"
                            value={characterData.data.description}
                            onChange={(e) => updateCharacterField("description", e.target.value)}
                            placeholder={t.placeholders.characterDescription}
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="mobile-personality">{t.personality}</Label>
                          <Textarea
                            id="mobile-personality"
                            value={characterData.data.personality}
                            onChange={(e) => updateCharacterField("personality", e.target.value)}
                            placeholder={t.placeholders.personalityTraits}
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="mobile-scenario">{t.scenario}</Label>
                          <Textarea
                            id="mobile-scenario"
                            value={characterData.data.scenario}
                            onChange={(e) => updateCharacterField("scenario", e.target.value)}
                            placeholder={t.placeholders.initialScenario}
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="mobile-first_mes">{t.firstMessage}</Label>
                          <Textarea
                            id="mobile-first_mes"
                            value={characterData.data.first_mes}
                            onChange={(e) => updateCharacterField("first_mes", e.target.value)}
                            placeholder={t.placeholders.firstMessage}
                            rows={3}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="advanced" className="space-y-4 flex-1 overflow-y-auto">
                        <div>
                          <Label htmlFor="mobile-mes_example">{t.messageExample}</Label>
                          <Textarea
                            id="mobile-mes_example"
                            value={characterData.data.mes_example}
                            onChange={(e) => updateCharacterField("mes_example", e.target.value)}
                            placeholder={t.placeholders.exampleConversation}
                            rows={4}
                          />
                        </div>

                        <div>
                          <Label htmlFor="mobile-system_prompt">{t.systemPrompt}</Label>
                          <Textarea
                            id="mobile-system_prompt"
                            value={characterData.data.system_prompt}
                            onChange={(e) => updateCharacterField("system_prompt", e.target.value)}
                            placeholder={t.placeholders.systemInstructions}
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="mobile-post_history_instructions">{t.postHistoryInstructions}</Label>
                          <Textarea
                            id="mobile-post_history_instructions"
                            value={characterData.data.post_history_instructions}
                            onChange={(e) => updateCharacterField("post_history_instructions", e.target.value)}
                            placeholder={t.placeholders.postHistoryInstructions}
                            rows={3}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label>{t.alternateGreetings}</Label>
                            <Button onClick={addAlternateGreeting} size="sm" variant="outline">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          {characterData.data.alternate_greetings.map((greeting, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                              <Textarea
                                value={greeting}
                                onChange={(e) => updateAlternateGreeting(index, e.target.value)}
                                placeholder={t.placeholders.alternateGreeting}
                                rows={2}
                              />
                              <Button onClick={() => removeAlternateGreeting(index)} size="sm" variant="destructive">
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="meta" className="space-y-4 flex-1 overflow-y-auto">
                        <div>
                          <Label htmlFor="mobile-creator">{t.creator}</Label>
                          <Input
                            id="mobile-creator"
                            value={characterData.data.creator}
                            onChange={(e) => updateCharacterField("creator", e.target.value)}
                            placeholder={t.placeholders.creatorName}
                          />
                        </div>

                        <div>
                          <Label htmlFor="mobile-character_version">{t.characterVersion}</Label>
                          <Input
                            id="mobile-character_version"
                            value={characterData.data.character_version}
                            onChange={(e) => updateCharacterField("character_version", e.target.value)}
                            placeholder="1.0"
                          />
                        </div>

                        <div>
                          <Label htmlFor="mobile-creator_notes">{t.creatorNotes}</Label>
                          <Textarea
                            id="mobile-creator_notes"
                            value={characterData.data.creator_notes}
                            onChange={(e) => updateCharacterField("creator_notes", e.target.value)}
                            placeholder={t.placeholders.notesForUsers}
                            rows={3}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label>{t.tags}</Label>
                            <Button onClick={addTag} size="sm" variant="outline">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {characterData.data.tags.map((tag, index) => (
                              <div
                                key={index}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                              >
                                {tag}
                                <button onClick={() => removeTag(index)} className="text-blue-600 hover:text-blue-800">
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 事件书段落 - 移动端版本 - 只在功能开关开启时显示 */}
                        {FEATURE_FLAGS.SHOW_EVENT_BOOK && (
                          <div className="border-t pt-4">
                            <div className="mb-2">
                              <Label className="text-base font-medium">
                                {interfaceLanguage === 'zh' ? '事件书' : 'Event Book'}
                              </Label>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-3">
                              {interfaceLanguage === 'zh' 
                                ? '事件书可以将一系列事件串联起来，让用户体验连续剧情。此内容不会包含在角色卡导出中。' 
                                : 'Event books link a series of events together, allowing users to experience continuous storylines. This content will not be included in character card exports.'}
                            </div>

                            {eventBook ? (
                              <div className="bg-gray-50 rounded-lg p-4 space-y-2 dark:bg-gray-800 dark:text-gray-400">
                                <div className="font-medium text-sm text-gray-600">{eventBook.meta.name}</div>
                                <div className="text-xs text-gray-600">{eventBook.meta.desp}</div>
                                <div className="text-xs text-gray-500">
                                  {interfaceLanguage === 'zh' ? '事件数量：' : 'Events: '}{eventBook.events.length}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {interfaceLanguage === 'zh' ? '事件编号：' : 'Event numbers: '}
                                  {eventBook.events.map(e => e.number).join(', ')}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm dark:bg-gray-800 dark:text-gray-400">
                                {interfaceLanguage === 'zh' 
                                  ? '暂无事件书，点击"生成事件书"根据角色设定创建背景故事' 
                                  : 'No event book yet, click "Generate Event Book" to create a background story based on character settings'}
                              </div>
                            )}

                            {/* 事件书操作按钮 */}
                            <div className="grid grid-cols-2 gap-2 pt-3">
                              <Button 
                                onClick={copyEventBookPrompt} 
                                size="sm" 
                                variant="outline"
                                className="text-xs"
                              >
                                {interfaceLanguage === 'zh' ? '复制提示词' : 'Copy Prompt'}
                              </Button>
                              {!eventBook ? (
                                <Button 
                                  onClick={openEventBookDialog} 
                                  size="sm" 
                                  variant="outline"
                                  disabled={isGeneratingEventBook}
                                  className="text-xs"
                                >
                                  {isGeneratingEventBook ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-1"></div>
                                      {interfaceLanguage === 'zh' ? '生成中' : 'Generating'}
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3 mr-1" />
                                      {interfaceLanguage === 'zh' ? '生成事件书' : 'Generate'}
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <>
                                  <Button onClick={openEventBookEditor} size="sm" variant="outline" className="text-xs">
                                    {interfaceLanguage === 'zh' ? '编辑' : 'Edit'}
                                  </Button>
                                  <Button onClick={downloadEventBook} size="sm" variant="outline" className="text-xs">
                                    {interfaceLanguage === 'zh' ? '下载' : 'Download'}
                                  </Button>
                                  <Button onClick={deleteEventBook} size="sm" variant="destructive" className="text-xs col-span-2 mt-2">
                                    {interfaceLanguage === 'zh' ? '删除事件书' : 'Delete Event Book'}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="character-book" className="flex-1 overflow-y-auto">
                        <CharacterBookManager
                          characterBook={characterData.data.character_book}
                          onUpdateCharacterBook={updateCharacterBook}
                          interfaceLanguage={interfaceLanguage}
                          t={t}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {/* Chat Tab */}
              {mobileActiveTab === 'chat' && (
                <ChatWindow
                  interfaceLanguage={interfaceLanguage}
                  t={t}
                  messages={messages}
                  streamingContent={streamingContent}
                  isChatLoading={isChatLoading}
                  chatInput={chatInput}
                  setChatInput={setChatInput}
                  onSendMessage={sendChatMessage}
                  onClearChat={clearChat}
                  onRegenerateLastMessage={regenerateLastMessage}
                  adjustmentPresets={getAdjustmentPresets()}
                  onApplyPreset={applyAdjustmentPreset}
                />
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Global Loading Overlay */}
      <GlobalLoadingOverlay
        interfaceLanguage={interfaceLanguage}
        globalLoading={globalLoading}
      />

      {/* 事件书编辑器全屏对话框 - 只在功能开关开启时显示 */}
      {FEATURE_FLAGS.SHOW_EVENT_BOOK && (
        <EventBookEditor
          interfaceLanguage={interfaceLanguage}
          isOpen={isEventBookEditorOpen}
          onOpenChange={setIsEventBookEditorOpen}
          eventBookJsonText={eventBookJsonText}
          setEventBookJsonText={setEventBookJsonText}
          onSave={saveEventBookEdit}
        />
      )}

      {/* 事件书生成对话框 - 只在功能开关开启时显示 */}
      {FEATURE_FLAGS.SHOW_EVENT_BOOK && (
        <EventBookDialog
          interfaceLanguage={interfaceLanguage}
          isOpen={isEventBookDialogOpen}
          onOpenChange={setIsEventBookDialogOpen}
          eventBookCount={eventBookCount}
          setEventBookCount={setEventBookCount}
          eventBookBackground={eventBookBackground}
          setEventBookBackground={setEventBookBackground}
          isGeneratingEventBook={isGeneratingEventBook}
          onGenerateEventBook={generateEventBookWithBackground}
        />
      )}

      {/* 全局对话框 */}
      <ExportDialog
        interfaceLanguage={interfaceLanguage}
        isOpen={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExportJson={exportAsJson}
        onExportPng={exportAsPng}
        hasRealImage={!!(characterImage && !characterImage.includes("placeholder.svg"))}
      />
      
              <SettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        apiKey={apiKey}
        setApiKey={setApiKey}
        apiBaseUrl={apiBaseUrl}
        setApiBaseUrl={setApiBaseUrl}
        imageModel={imageModel}
        setImageModel={setImageModel}
        chatModel={chatModel}
        setChatModel={setChatModel}
        eventBookModel={eventBookModel}
        setEventBookModel={setEventBookModel}
        language={language}
        setLanguage={setLanguage}
        customLanguage={customLanguage}
        setCustomLanguage={setCustomLanguage}
        interfaceLanguage={interfaceLanguage}
        setInterfaceLanguage={(newLang: 'zh' | 'en') => {
          // 当界面语言改变时，自动更新相关配置（如果当前是默认配置的话）
          const oldConfig = getLanguageSpecificConfig(interfaceLanguage)
          const newConfig = getLanguageSpecificConfig(newLang)
          
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
          
          setInterfaceLanguage(newLang)
        }}
        onSave={saveSettings}
        onClear={clearSettings}
      />

      <Toaster />
    </div>
  )
}
