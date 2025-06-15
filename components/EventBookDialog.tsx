"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UI_TEXTS } from "@/lib/i18n"

interface EventBookDialogProps {
  interfaceLanguage: 'zh' | 'en'
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  eventBookCount: number
  setEventBookCount: (count: number) => void
  eventBookBackground: string
  setEventBookBackground: (background: string) => void
  isGeneratingEventBook: boolean
  onGenerateEventBook: () => void
}

export function EventBookDialog({
  interfaceLanguage,
  isOpen,
  onOpenChange,
  eventBookCount,
  setEventBookCount,
  eventBookBackground,
  setEventBookBackground,
  isGeneratingEventBook,
  onGenerateEventBook
}: EventBookDialogProps) {
  const t = UI_TEXTS[interfaceLanguage]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.generateEventBook}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="event-book-count">{t.eventBookCount}</Label>
            <p className="text-sm text-gray-600 mb-2">{t.eventBookCountDesc}</p>
            <Input
              id="event-book-count"
              type="number"
              min={3}
              max={99}
              value={eventBookCount}
              onChange={(e) => setEventBookCount(Math.max(3, Math.min(99, parseInt(e.target.value) || 5)))}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="event-book-background">{t.eventBookBackground}</Label>
            <p className="text-sm text-gray-600 mb-2">{t.eventBookBackgroundDesc}</p>
            <Textarea
              id="event-book-background"
              value={eventBookBackground}
              onChange={(e) => setEventBookBackground(e.target.value)}
              placeholder={t.eventBookBackgroundPlaceholder}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              {t.cancel}
            </Button>
            <Button onClick={onGenerateEventBook} disabled={isGeneratingEventBook}>
              {isGeneratingEventBook ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  {interfaceLanguage === 'zh' ? '生成中...' : 'Generating...'}
                </>
              ) : (
                t.generateEventBook
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 