"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight } from "lucide-react"
import { CharacterBook } from "@/lib/types"
import type { UI_TEXTS } from "@/lib/i18n"

interface CharacterBookManagerProps {
  characterBook?: CharacterBook
  onUpdateCharacterBook: (book?: CharacterBook) => void
  interfaceLanguage: 'zh' | 'en'
  t: typeof UI_TEXTS['zh']
}

export function CharacterBookManager({ 
  characterBook, 
  onUpdateCharacterBook, 
  interfaceLanguage,
  t 
}: CharacterBookManagerProps) {
  const [isEditingEntry, setIsEditingEntry] = useState(false)
  const [editingEntryIndex, setEditingEntryIndex] = useState<number>(-1)
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set())

  // 创建新角色书
  const createNewCharacterBook = () => {
    const newBook: CharacterBook = {
      name: interfaceLanguage === 'zh' ? '角色知识库' : 'Character Lore',
      description: interfaceLanguage === 'zh' ? '关于角色的背景知识和世界观设定' : 'Background knowledge and worldbuilding about the character',
      scan_depth: 100,
      token_budget: 500,
      recursive_scanning: true,
      extensions: {},
      entries: []
    }
    onUpdateCharacterBook(newBook)
  }

  // 删除角色书  
  const deleteCharacterBook = () => {
    if (confirm(interfaceLanguage === 'zh' ? '确定要删除角色书吗？' : 'Are you sure you want to delete the character book?')) {
      onUpdateCharacterBook(undefined)
    }
  }

  // 更新角色书基本信息
  const updateCharacterBookInfo = (field: keyof CharacterBook, value: any) => {
    if (!characterBook) return
    onUpdateCharacterBook({
      ...characterBook,
      [field]: value
    })
  }

  // 添加新条目
  const addNewEntry = () => {
    if (!characterBook) return
    
    const newEntry = {
      keys: [''],
      content: '',
      extensions: {},
      enabled: true,
      insertion_order: characterBook.entries.length,
      case_sensitive: false,
      name: interfaceLanguage === 'zh' ? '新条目' : 'New Entry',
      priority: 100,
      id: Date.now(),
      comment: '',
      selective: false,
      secondary_keys: [],
      constant: false,
      position: 'after_char' as const
    }

    onUpdateCharacterBook({
      ...characterBook,
      entries: [...characterBook.entries, newEntry]
    })
  }

  // 删除条目
  const deleteEntry = (index: number) => {
    if (!characterBook) return
    
    const newEntries = characterBook.entries.filter((_, i) => i !== index)
    onUpdateCharacterBook({
      ...characterBook,
      entries: newEntries
    })
  }

  // 更新条目
  const updateEntry = (index: number, field: string, value: any) => {
    if (!characterBook) return
    
    const newEntries = [...characterBook.entries]
    newEntries[index] = {
      ...newEntries[index],
      [field]: value
    }
    
    onUpdateCharacterBook({
      ...characterBook,
      entries: newEntries
    })
  }

  // 更新条目的keys数组
  const updateEntryKeys = (index: number, keys: string[]) => {
    updateEntry(index, 'keys', keys.filter(key => key.trim() !== ''))
  }

  // 更新条目的secondary_keys数组
  const updateEntrySecondaryKeys = (index: number, keys: string[]) => {
    updateEntry(index, 'secondary_keys', keys.filter(key => key.trim() !== ''))
  }

  // 切换条目展开状态
  const toggleEntryExpanded = (index: number) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedEntries(newExpanded)
  }

  if (!characterBook) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          {interfaceLanguage === 'zh' 
            ? '角色书是一个强大的工具，可以动态地将相关背景信息插入到对话中，帮助AI更好地理解角色的世界观和背景设定。' 
            : 'Character Book is a powerful tool that dynamically inserts relevant background information into conversations, helping the AI better understand the character\'s worldview and background settings.'}
        </div>
        
        <div className="bg-muted/50 rounded-lg p-6 text-center">
          <div className="text-muted-foreground mb-4">
            {interfaceLanguage === 'zh' ? '暂无角色书' : 'No Character Book'}
          </div>
          <Button onClick={createNewCharacterBook}>
            <Plus className="w-4 h-4 mr-2" />
            {interfaceLanguage === 'zh' ? '创建角色书' : 'Create Character Book'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 角色书基本信息 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              {interfaceLanguage === 'zh' ? '角色书设置' : 'Character Book Settings'}
            </CardTitle>
            <Button 
              onClick={deleteCharacterBook} 
              variant="destructive" 
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {interfaceLanguage === 'zh' ? '删除角色书' : 'Delete Book'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{interfaceLanguage === 'zh' ? '名称' : 'Name'}</Label>
            <Input
              value={characterBook.name || ''}
              onChange={(e) => updateCharacterBookInfo('name', e.target.value)}
              placeholder={interfaceLanguage === 'zh' ? '角色知识库' : 'Character Lore'}
            />
          </div>
          
          <div>
            <Label>{interfaceLanguage === 'zh' ? '描述' : 'Description'}</Label>
            <Textarea
              value={characterBook.description || ''}
              onChange={(e) => updateCharacterBookInfo('description', e.target.value)}
              placeholder={interfaceLanguage === 'zh' ? '描述这个角色书的内容和用途' : 'Describe the content and purpose of this character book'}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>{interfaceLanguage === 'zh' ? '扫描深度' : 'Scan Depth'}</Label>
              <Input
                type="number"
                value={characterBook.scan_depth || 100}
                onChange={(e) => updateCharacterBookInfo('scan_depth', parseInt(e.target.value) || 100)}
                min={1}
                max={1000}
              />
            </div>
            
            <div>
              <Label>{interfaceLanguage === 'zh' ? 'Token预算' : 'Token Budget'}</Label>
              <Input
                type="number"
                value={characterBook.token_budget || 500}
                onChange={(e) => updateCharacterBookInfo('token_budget', parseInt(e.target.value) || 500)}
                min={50}
                max={2000}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={characterBook.recursive_scanning || false}
                onCheckedChange={(checked) => updateCharacterBookInfo('recursive_scanning', checked)}
              />
              <Label>{interfaceLanguage === 'zh' ? '递归扫描' : 'Recursive Scanning'}</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 条目列表 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              {interfaceLanguage === 'zh' ? '知识条目' : 'Lore Entries'} ({characterBook.entries.length})
            </CardTitle>
            <Button onClick={addNewEntry} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {interfaceLanguage === 'zh' ? '添加条目' : 'Add Entry'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {characterBook.entries.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {interfaceLanguage === 'zh' ? '暂无条目，点击上方按钮添加' : 'No entries yet, click the button above to add'}
            </div>
          ) : (
            <div className="space-y-4">
              {characterBook.entries.map((entry, index) => (
                <Card key={entry.id || index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleEntryExpanded(index)}
                        className="flex items-center space-x-2 text-left flex-1"
                      >
                        {expandedEntries.has(index) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <div>
                          <div className="font-medium">
                            {entry.name || `${interfaceLanguage === 'zh' ? '条目' : 'Entry'} ${index + 1}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {interfaceLanguage === 'zh' ? '关键词: ' : 'Keywords: '}
                            {entry.keys.join(', ') || (interfaceLanguage === 'zh' ? '无' : 'None')}
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={entry.enabled}
                          onCheckedChange={(checked) => updateEntry(index, 'enabled', checked)}
                        />
                        <Button
                          onClick={() => deleteEntry(index)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {expandedEntries.has(index) && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>{interfaceLanguage === 'zh' ? '条目名称' : 'Entry Name'}</Label>
                          <Input
                            value={entry.name || ''}
                            onChange={(e) => updateEntry(index, 'name', e.target.value)}
                            placeholder={interfaceLanguage === 'zh' ? '条目名称' : 'Entry name'}
                          />
                        </div>
                        
                        <div>
                          <Label>{interfaceLanguage === 'zh' ? '插入顺序' : 'Insertion Order'}</Label>
                          <Input
                            type="number"
                            value={entry.insertion_order}
                            onChange={(e) => updateEntry(index, 'insertion_order', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>{interfaceLanguage === 'zh' ? '触发关键词 (逗号分隔)' : 'Trigger Keywords (comma separated)'}</Label>
                        <Input
                          value={entry.keys.join(', ')}
                          onChange={(e) => updateEntryKeys(index, e.target.value.split(',').map(k => k.trim()))}
                          placeholder={interfaceLanguage === 'zh' ? '关键词1, 关键词2, 关键词3' : 'keyword1, keyword2, keyword3'}
                        />
                      </div>

                      <div>
                        <Label>{interfaceLanguage === 'zh' ? '内容' : 'Content'}</Label>
                        <Textarea
                          value={entry.content}
                          onChange={(e) => updateEntry(index, 'content', e.target.value)}
                          placeholder={interfaceLanguage === 'zh' ? '当关键词被触发时要插入的内容...' : 'Content to insert when keywords are triggered...'}
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label>{interfaceLanguage === 'zh' ? '备注' : 'Comment'}</Label>
                        <Input
                          value={entry.comment || ''}
                          onChange={(e) => updateEntry(index, 'comment', e.target.value)}
                          placeholder={interfaceLanguage === 'zh' ? '条目备注说明' : 'Entry comment'}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>{interfaceLanguage === 'zh' ? '优先级' : 'Priority'}</Label>
                          <Input
                            type="number"
                            value={entry.priority || 100}
                            onChange={(e) => updateEntry(index, 'priority', parseInt(e.target.value) || 100)}
                            min={1}
                            max={999}
                          />
                        </div>
                        
                        <div>
                          <Label>{interfaceLanguage === 'zh' ? '插入位置' : 'Position'}</Label>
                          <Select
                            value={entry.position || 'after_char'}
                            onValueChange={(value) => updateEntry(index, 'position', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="before_char">
                                {interfaceLanguage === 'zh' ? '角色定义前' : 'Before Character'}
                              </SelectItem>
                              <SelectItem value="after_char">
                                {interfaceLanguage === 'zh' ? '角色定义后' : 'After Character'}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={entry.case_sensitive || false}
                            onCheckedChange={(checked) => updateEntry(index, 'case_sensitive', checked)}
                          />
                          <Label>{interfaceLanguage === 'zh' ? '区分大小写' : 'Case Sensitive'}</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={entry.constant || false}
                            onCheckedChange={(checked) => updateEntry(index, 'constant', checked)}
                          />
                          <Label>{interfaceLanguage === 'zh' ? '总是插入' : 'Always Insert'}</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={entry.selective || false}
                            onCheckedChange={(checked) => updateEntry(index, 'selective', checked)}
                          />
                          <Label>{interfaceLanguage === 'zh' ? '选择性触发' : 'Selective'}</Label>
                        </div>
                      </div>

                      {entry.selective && (
                        <div>
                          <Label>{interfaceLanguage === 'zh' ? '次要关键词 (逗号分隔)' : 'Secondary Keywords (comma separated)'}</Label>
                          <Input
                            value={(entry.secondary_keys || []).join(', ')}
                            onChange={(e) => updateEntrySecondaryKeys(index, e.target.value.split(',').map(k => k.trim()))}
                            placeholder={interfaceLanguage === 'zh' ? '次要关键词1, 次要关键词2' : 'secondary1, secondary2'}
                          />
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 