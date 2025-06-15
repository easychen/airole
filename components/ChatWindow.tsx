"use client"

import React, { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Trash2 } from "lucide-react"
import type { ChatMessage } from "@/lib/types"
import { AdjustmentPresets } from "@/components/AdjustmentPresets"

interface ChatWindowProps {
  interfaceLanguage: 'zh' | 'en'
  t: any // UI texts object
  messages: ChatMessage[]
  streamingContent: string
  isChatLoading: boolean
  chatInput: string
  setChatInput: (value: string) => void
  onSendMessage: () => void
  onClearChat: () => void
  onRegenerateLastMessage: () => void
  adjustmentPresets: Array<{ name: string; content: string }>
  onApplyPreset: (content: string) => void
}

export function ChatWindow({
  interfaceLanguage,
  t,
  messages,
  streamingContent,
  isChatLoading,
  chatInput,
  setChatInput,
  onSendMessage,
  onClearChat,
  onRegenerateLastMessage,
  adjustmentPresets,
  onApplyPreset
}: ChatWindowProps) {
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  // 自动滚动到聊天底部
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [messages, streamingContent])

  return (
    <div className="flex flex-col min-h-0 max-h-full">
      <Card className="flex-1 flex flex-col min-h-0 max-h-full">
        <CardHeader className="flex-shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle>{t.aiAssistant}</CardTitle>
            <Button onClick={onClearChat} size="sm" variant="ghost" className="h-8 px-2">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div
            ref={chatMessagesRef}
            className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 min-h-0"
          >
            {messages.map((message, index) => (
              <div key={message.id}>
                <div
                  className={`p-3 rounded-lg ${
                    message.role === "user" ? "bg-primary text-primary-foreground ml-8" : "bg-muted text-muted-foreground mr-8"
                  }`}
                >
                  <div className="text-sm opacity-75 mb-1">{message.role === "user" ? t.you : t.aiAssistant}</div>
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                </div>
                {/* 只在最后一条AI消息下显示重新生成按钮 */}
                {message.role === "assistant" && index === messages.length - 1 && !isChatLoading && (
                  <div className="flex justify-end mr-8 mt-2">
                    <Button
                      onClick={onRegenerateLastMessage}
                      size="sm"
                      variant="ghost"
                      className="text-gray-500 hover:text-gray-700"
                      disabled={isChatLoading}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      {t.regenerate}
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {streamingContent && (
              <div className="bg-muted text-muted-foreground mr-8 p-3 rounded-lg">
                <div className="text-sm opacity-75 mb-1">{t.aiAssistant}</div>
                <div className="whitespace-pre-wrap break-words">{streamingContent}</div>
              </div>
            )}
            {isChatLoading && !streamingContent && (
              <div className="bg-muted text-muted-foreground mr-8 p-3 rounded-lg">
                <div className="text-sm opacity-75 mb-1">{t.aiAssistant}</div>
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  {t.thinking}
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 space-y-2">
            {/* 常用调整方案按钮 */}
            <AdjustmentPresets
              interfaceLanguage={interfaceLanguage}
              presets={adjustmentPresets}
              onApplyPreset={onApplyPreset}
            />

            <Textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t.askForImprovements}
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  onSendMessage()
                }
              }}
            />
            <div className="flex justify-between">
              <Button onClick={onClearChat} size="sm" variant="outline">
                <Trash2 className="w-4 h-4 mr-1" />
                {t.newTopic}
              </Button>
              <Button onClick={onSendMessage} disabled={isChatLoading || !chatInput.trim()}>
                {t.send}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 