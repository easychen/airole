"use client"

import React, { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, AlertCircle } from "lucide-react"
import { UI_TEXTS } from "@/lib/i18n"

interface VideoDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  interfaceLanguage: 'zh' | 'en'
  videoUrl: string
}

export function VideoDialog({
  isOpen,
  onOpenChange,
  interfaceLanguage,
  videoUrl
}: VideoDialogProps) {
  const t = UI_TEXTS[interfaceLanguage]
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleVideoError = () => {
    setVideoError(true)
  }

  const handleClose = () => {
    // 暂停视频
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setVideoError(false)
    onOpenChange(false)
  }

  const handleRetry = () => {
    setVideoError(false)
    if (videoRef.current) {
      videoRef.current.load()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl w-full mx-4 max-h-[90vh] p-0 overflow-hidden"
        showCloseButton={false}
      >
        <div className="relative">
          {/* 头部 */}
          <DialogHeader className="px-6 py-4 border-b relative">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                {t.demoVideo}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* 视频区域 */}
          <div className="relative bg-black">
            {videoError ? (
              <div className="flex flex-col items-center justify-center h-[50vh] md:h-[60vh] text-white">
                <AlertCircle className="h-12 w-12 mb-4 text-red-400" />
                <p className="text-center px-4">{t.videoLoadError}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleRetry}
                >
                  {interfaceLanguage === 'zh' ? '重试' : 'Retry'}
                </Button>
              </div>
            ) : (
              <video
                ref={videoRef}
                key={videoUrl}
                className="w-full h-[50vh] md:h-[60vh] object-contain"
                controls
                preload="metadata"
                onError={handleVideoError}
                playsInline
                webkit-playsinline="true"
                controlsList="nodownload"
              >
                <source src={videoUrl} type="video/mp4" />
                {interfaceLanguage === 'zh' ? 
                  '您的浏览器不支持视频播放。' : 
                  'Your browser does not support video playback.'}
              </video>
            )}
          </div>

          {/* 底部操作区 */}
          <div className="px-6 py-4 border-t bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between items-center">
              
              <Button onClick={handleClose} variant="outline">
                {t.closeVideo}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 