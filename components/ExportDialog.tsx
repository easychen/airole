"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download } from "lucide-react"
import { UI_TEXTS } from "@/lib/i18n"

interface ExportDialogProps {
  interfaceLanguage: 'zh' | 'en'
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onExportJson: () => void
  onExportPng: () => void
  hasRealImage?: boolean
}

export function ExportDialog({
  interfaceLanguage,
  isOpen,
  onOpenChange,
  onExportJson,
  onExportPng,
  hasRealImage = true
}: ExportDialogProps) {
  const t = UI_TEXTS[interfaceLanguage]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.exportFormat}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{t.selectExportFormat}</p>
          <div className="space-y-2">
            <Button onClick={onExportJson} className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {t.exportAsJson}
            </Button>
            <Button 
              onClick={onExportPng} 
              className="w-full" 
              variant="outline"
              disabled={!hasRealImage}
            >
              <Download className="w-4 h-4 mr-2" />
              {t.exportAsPng}
              {!hasRealImage && (
                <span className="ml-2 text-xs text-gray-500">
                  ({interfaceLanguage === 'zh' ? '需要上传图片' : 'Image required'})
                </span>
              )}
            </Button>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)} variant="ghost">
              {t.cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 