import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { UI_TEXTS } from '@/lib/i18n'

export async function POST(request: NextRequest) {
  const { accessToken, fileId, interfaceLanguage = 'en' } = await request.json()
  const t = UI_TEXTS[interfaceLanguage as 'zh' | 'en'] || UI_TEXTS.en
  
  try {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json({ error: 'Google Drive integration not configured' }, { status: 503 })
    }

    if (!accessToken) {
      return NextResponse.json({ error: t.googleDriveMessages.unauthorized }, { status: 401 })
    }

    if (!fileId) {
      return NextResponse.json({ error: t.googleDriveMessages.fileNotFound }, { status: 400 })
    }

    // 创建Google Drive客户端
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    // 获取文件内容
    const response = await drive.files.get({
      fileId,
      alt: 'media',
    })

    if (!response.data) {
      return NextResponse.json({ error: t.googleDriveMessages.fileNotFound }, { status: 404 })
    }

    // 解析JSON数据
    let loadedData
    try {
      loadedData = typeof response.data === 'string' 
        ? JSON.parse(response.data) 
        : response.data
    } catch (parseError) {
      return NextResponse.json({ 
        error: t.googleDriveMessages.invalidFileFormat,
        details: t.googleDriveMessages.invalidFileFormat
      }, { status: 400 })
    }

    // 检查数据格式，支持新旧格式
    let characterData, characterImage, chatMessages
    
    if (loadedData.characterData) {
      // 新格式：包含完整数据包
      characterData = loadedData.characterData
      characterImage = loadedData.characterImage
      chatMessages = loadedData.chatMessages || []
    } else {
      // 旧格式：只有角色数据
      characterData = loadedData
      characterImage = null
      chatMessages = []
    }

    return NextResponse.json({
      success: true,
      characterData,
      characterImage,
      chatMessages,
      message: t.googleDriveMessages.loadSuccess
    })

  } catch (error) {
    console.error('从Google Drive加载失败:', error)
    return NextResponse.json({ 
      error: t.googleDriveMessages.loadError,
      details: error instanceof Error ? error.message : t.googleDriveMessages.unknownError
    }, { status: 500 })
  }
} 