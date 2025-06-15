"use client"

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Cloud, CloudOff, Upload, Download, RefreshCw, Trash2, FileText, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { TavernCardV2 } from '@/lib/types'

interface GoogleDriveFile {
  id: string
  name: string
  modifiedTime: string
  size: string
}

interface GoogleDriveManagerProps {
  interfaceLanguage: 'zh' | 'en'
  characterData: TavernCardV2
  characterImage: string
  chatMessages: any[]
  onLoadCharacterData: (data: TavernCardV2, image?: string, messages?: any[]) => void
}

export function GoogleDriveManager({ 
  interfaceLanguage, 
  characterData, 
  characterImage,
  chatMessages,
  onLoadCharacterData 
}: GoogleDriveManagerProps) {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [files, setFiles] = useState<GoogleDriveFile[]>([])
  const [saveFileName, setSaveFileName] = useState('')

  // Check if Google OAuth is configured
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false)
  
  useEffect(() => {
    // Check if Google configuration is available by trying to get provider info
    fetch('/api/auth/providers')
      .then(res => res.json())
      .then(providers => {
        setIsGoogleConfigured(!!providers.google)
      })
      .catch(() => {
        setIsGoogleConfigured(false)
      })
  }, [])

  const t = {
    zh: {
      googleDrive: 'Google Drive',
      signIn: '登录Google',
      signOut: '退出登录',
      signedInAs: '已登录为',
      saveToCloud: '保存到云端',
      loadFromCloud: '从云端加载',
      fileName: '文件名',
      save: '保存',
      load: '加载',
      refresh: '刷新',
      delete: '删除',
      noFiles: '暂无文件',
      saving: '保存中...',
      loading: '加载中...',
      refreshing: '刷新中...',
      saveSuccess: '保存成功',
      loadSuccess: '加载成功',
      deleteSuccess: '删除成功',
      confirmDelete: '确定要删除这个文件吗？',
      errorOccurred: '操作失败',
      enterFileName: '请输入文件名',
      characterName: '角色名',
      lastModified: '最后修改',
      fileSize: '大小',
      authExpired: '授权已过期',
      reauthorizeNeeded: '您的Google授权已过期，请重新登录',
      reauthorize: '重新授权',
      loadError: '加载失败',
      saveError: '保存失败',
      listError: '获取文件列表失败',
      signInPrompt: '请先登录Google账户',
    },
    en: {
      googleDrive: 'Google Drive',
      signIn: 'Sign in to Google',
      signOut: 'Sign out',
      signedInAs: 'Signed in as',
      saveToCloud: 'Save to Cloud',
      loadFromCloud: 'Load from Cloud',
      fileName: 'File Name',
      save: 'Save',
      load: 'Load',
      refresh: 'Refresh',
      delete: 'Delete',
      noFiles: 'No files',
      saving: 'Saving...',
      loading: 'Loading...',
      refreshing: 'Refreshing...',
      saveSuccess: 'Saved successfully',
      loadSuccess: 'Loaded successfully',
      deleteSuccess: 'Deleted successfully',
      confirmDelete: 'Are you sure you want to delete this file?',
      errorOccurred: 'Operation failed',
      enterFileName: 'Please enter a file name',
      characterName: 'Character Name',
      lastModified: 'Last Modified',
      fileSize: 'Size',
      authExpired: 'Authorization Expired',
      reauthorizeNeeded: 'Your Google authorization has expired, please sign in again',
      reauthorize: 'Reauthorize',
      loadError: 'Load failed',
      saveError: 'Save failed',
      listError: 'Failed to load file list',
      signInPrompt: 'Please sign in to your Google account',
    }
  }[interfaceLanguage]

  // 处理API响应，检查是否需要重新授权
  const handleApiResponse = async (response: Response, operation: string) => {
    if (response.status === 401) {
      // 授权过期，清除session并提示重新登录
      await signOut({ redirect: false })
      toast({
        title: t.authExpired,
        description: t.reauthorizeNeeded,
        variant: 'destructive',
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => signIn('google')}
          >
            {t.reauthorize}
          </Button>
        ),
      })
      return null
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ details: 'Unknown error' }))
      throw new Error(error.details || `${operation} failed`)
    }

    return response.json()
  }

  // 自动设置文件名
  useEffect(() => {
    if (characterData.data.name) {
      setSaveFileName(`${characterData.data.name}.json`)
    } else {
      setSaveFileName('character.json')
    }
  }, [characterData.data.name])

  // 加载文件列表
  const loadFiles = async () => {
    if (!session?.accessToken) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/google-drive/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: session.accessToken,
          interfaceLanguage,
        }),
      })

      const data = await handleApiResponse(response, 'Load files')
      if (data) {
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error('Error loading files:', error)
      toast({
        title: t.errorOccurred,
        description: t.listError,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 保存文件
  const saveFile = async () => {
    if (!session?.accessToken) return
    if (!saveFileName.trim()) {
      toast({
        title: t.errorOccurred,
        description: t.enterFileName,
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/google-drive/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: session.accessToken,
          characterData,
          characterImage,
          chatMessages,
          fileName: saveFileName.endsWith('.json') ? saveFileName : `${saveFileName}.json`,
          interfaceLanguage,
        }),
      })

      const data = await handleApiResponse(response, 'Save file')
      if (data) {
        toast({
          title: t.saveSuccess,
          description: data.message,
        })
        loadFiles() // 刷新文件列表
      }
    } catch (error) {
      console.error('Error saving file:', error)
      toast({
        title: t.errorOccurred,
        description: t.saveError,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 加载文件
  const loadFile = async (fileId: string) => {
    if (!session?.accessToken) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/google-drive/load', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: session.accessToken,
          fileId,
          interfaceLanguage,
        }),
      })

      const data = await handleApiResponse(response, 'Load file')
      if (data) {
        onLoadCharacterData(data.characterData, data.characterImage, data.chatMessages)
        toast({
          title: t.loadSuccess,
          description: data.message,
        })
        setIsOpen(false)
      }
    } catch (error) {
      console.error('Error loading file:', error)
      toast({
        title: t.errorOccurred,
        description: t.loadError,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 格式化文件大小
  const formatFileSize = (size: string) => {
    const bytes = parseInt(size)
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // 格式化时间
  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  // 打开对话框时加载文件
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && session?.accessToken) {
      loadFiles()
    }
  }

  // Don't render if Google OAuth is not configured
  if (!isGoogleConfigured) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Cloud className="w-4 h-4 mr-2" />
          {t.googleDrive}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            {t.googleDrive}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {status === 'loading' ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : !session ? (
            <div className="text-center py-8">
              <CloudOff className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {t.signInPrompt}
              </p>
              <Button onClick={() => signIn('google')}>
                {t.signIn}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 用户信息 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src={session.user?.image || ''} 
                    alt={session.user?.name || ''} 
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  {t.signOut}
                </Button>
              </div>

              <Separator />

              {/* 保存部分 */}
              <div className="space-y-3">
                <Label className="text-base font-medium">{t.saveToCloud}</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={saveFileName}
                      onChange={(e) => setSaveFileName(e.target.value)}
                      placeholder={t.fileName}
                    />
                  </div>
                  <Button onClick={saveFile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {t.saving}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {t.save}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* 加载部分 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">{t.loadFromCloud}</Label>
                  <Button variant="outline" size="sm" onClick={loadFiles} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                <ScrollArea className="h-64 border rounded-md">
                  {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <FileText className="w-8 h-8 mb-2" />
                      <p>{t.noFiles}</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-2">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-500" />
                              <span className="font-medium truncate">{file.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatTime(file.modifiedTime)}
                              </span>
                              <span>{formatFileSize(file.size)}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadFile(file.id)}
                              disabled={isLoading}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 