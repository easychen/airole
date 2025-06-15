"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { History, Plus } from "lucide-react"
import { UI_TEXTS } from "@/lib/i18n"
import type { CharacterVersion } from "@/lib/types"

interface VersionHistoryDialogProps {
  interfaceLanguage: 'zh' | 'en'
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  characterVersions: CharacterVersion[]
  currentVersionId: string
  getCurrentVersion: () => CharacterVersion | undefined
  onSaveAsNewVersion: () => void
  onSwitchToVersion: (versionId: string) => void
}

export function VersionHistoryDialog({
  interfaceLanguage,
  isOpen,
  onOpenChange,
  characterVersions,
  currentVersionId,
  getCurrentVersion,
  onSaveAsNewVersion,
  onSwitchToVersion
}: VersionHistoryDialogProps) {
  const t = UI_TEXTS[interfaceLanguage]

  const handleSaveAsNewVersion = () => {
    onSaveAsNewVersion()
    onOpenChange(false)
  }

  const handleSwitchToVersion = (versionId: string) => {
    onSwitchToVersion(versionId)
    onOpenChange(false)
  }

  if (characterVersions.length === 0) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="w-4 h-4 mr-2" />
          {getCurrentVersion()?.label || `V${getCurrentVersion()?.version || 1}`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.versionHistory}</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <Button 
            onClick={handleSaveAsNewVersion}
            className="w-full"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.saveAsNewVersion}
          </Button>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {characterVersions.slice().reverse().map((version) => (
            <div
              key={version.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                version.id === currentVersionId
                  ? 'border-blue-500 bg-blue-50 dark:bg-gray-800 dark:border-gray-950 dark:text-white'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 dark:text-white'
              }`}
              onClick={() => handleSwitchToVersion(version.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {version.label || `V${version.version}`}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {version.timestamp.toLocaleString(interfaceLanguage === 'zh' ? 'zh-CN' : 'en-US')}
                  </div>
                  {version.data.name && (
                    <div className="text-xs text-gray-600 mt-1 truncate">
                      {interfaceLanguage === 'zh' ? '角色：' : 'Character: '}{version.data.name}
                    </div>
                  )}
                </div>
                {version.id === currentVersionId && (
                  <div className="text-xs text-blue-600 font-medium ml-2">
                    {t.currentVersion}
                  </div>
                )}
              </div>
              {version.id !== currentVersionId && (
                <div className="text-xs text-gray-500 mt-2">
                  {t.switchToVersion}
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
} 