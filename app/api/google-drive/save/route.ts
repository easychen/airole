import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { UI_TEXTS } from '@/lib/i18n'

export async function POST(request: NextRequest) {
  const { accessToken, characterData, fileName, characterImage, chatMessages, interfaceLanguage = 'en' } = await request.json()
  const t = UI_TEXTS[interfaceLanguage as 'zh' | 'en'] || UI_TEXTS.en
  
  try {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json({ error: 'Google Drive integration not configured' }, { status: 503 })
    }

    if (!accessToken) {
      return NextResponse.json({ error: t.googleDriveMessages.unauthorized }, { status: 401 })
    }

    // 创建Google Drive客户端
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    // 检查是否已存在AIRole角色数据文件夹
    const folderSearchResponse = await drive.files.list({
      q: "name='AIRole_Characters' and mimeType='application/vnd.google-apps.folder'",
      fields: 'files(id, name)',
    })

    let folderId = null
    if (folderSearchResponse.data.files && folderSearchResponse.data.files.length > 0) {
      folderId = folderSearchResponse.data.files[0].id
    } else {
      // 创建文件夹
      const folderResponse = await drive.files.create({
        requestBody: {
          name: 'AIRole_Characters',
          mimeType: 'application/vnd.google-apps.folder',
        },
      })
      folderId = folderResponse.data.id
    }

    // 检查是否已存在同名文件
    const existingFileResponse = await drive.files.list({
      q: `name='${fileName}' and parents='${folderId}'`,
      fields: 'files(id, name)',
    })

    const fileMetadata = {
      name: fileName,
      parents: folderId ? [folderId] : undefined,
    }

    // 创建完整的数据包，包含角色数据、图片和聊天记录
    const fullData = {
      characterData,
      characterImage: characterImage || null,
      chatMessages: chatMessages || [],
      savedAt: new Date().toISOString(),
      version: '1.0'
    }

    const media = {
      mimeType: 'application/json',
      body: JSON.stringify(fullData, null, 2),
    }

    let response
    if (existingFileResponse.data.files && existingFileResponse.data.files.length > 0) {
      // 更新现有文件
      const fileId = existingFileResponse.data.files[0].id!
      response = await drive.files.update({
        fileId,
        media,
      })
    } else {
      // 创建新文件
      response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id',
      })
    }

    return NextResponse.json({
      success: true,
      fileId: response.data.id,
      message: t.googleDriveMessages.saveSuccess
    })

  } catch (error) {
    console.error('保存到Google Drive失败:', error)
    return NextResponse.json({ 
      error: t.googleDriveMessages.saveError,
      details: error instanceof Error ? error.message : t.googleDriveMessages.unknownError
    }, { status: 500 })
  }
} 