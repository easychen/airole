"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface EventBookEditorProps {
  interfaceLanguage: 'zh' | 'en'
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  eventBookJsonText: string
  setEventBookJsonText: (text: string) => void
  onSave: () => void
}

export function EventBookEditor({
  interfaceLanguage,
  isOpen,
  onOpenChange,
  eventBookJsonText,
  setEventBookJsonText,
  onSave
}: EventBookEditorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 m-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="flex-shrink-0 p-6 border-b">
            <DialogTitle className="flex justify-between items-center">
              <span>{interfaceLanguage === 'zh' ? '事件书编辑器' : 'Event Book Editor'}</span>
              <div className="flex gap-2">
                <Button onClick={onSave} size="sm">
                  {interfaceLanguage === 'zh' ? '保存' : 'Save'}
                </Button>
                <Button onClick={() => onOpenChange(false)} size="sm" variant="outline">
                  {interfaceLanguage === 'zh' ? '取消' : 'Cancel'}
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-6 overflow-hidden">
            <Textarea
              value={eventBookJsonText}
              onChange={(e) => setEventBookJsonText(e.target.value)}
              className="w-full h-full resize-none font-mono text-sm"
              placeholder={interfaceLanguage === 'zh' 
                ? '在此编辑事件书JSON数据...' 
                : 'Edit event book JSON data here...'}
            />
          </div>
          <div className="flex-shrink-0 p-4 border-t bg-gray-50 text-xs text-gray-600">
            {interfaceLanguage === 'zh' 
              ? '提示：请确保JSON格式正确。事件书应包含id、meta和events字段。' 
              : 'Tip: Please ensure the JSON format is correct. Event book should contain id, meta, and events fields.'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 