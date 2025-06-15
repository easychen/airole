export type TavernCardV2 = {
  spec: "chara_card_v2"
  spec_version: "2.0"
  data: {
    name: string
    description: string
    personality: string
    scenario: string
    first_mes: string
    mes_example: string
    creator_notes: string
    system_prompt: string
    post_history_instructions: string
    alternate_greetings: Array<string>
    character_book?: CharacterBook
    tags: Array<string>
    creator: string
    character_version: string
    extensions: Record<string, any>
  }
}

// 添加事件书相关类型定义
export type EventBookCondition = {
  key: string
  op: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains" | "notcontains" | "empty" | "notempty"
  value?: any
}

export type EventBookEvent = {
  id: string
  number: number
  title: string
  desp: string
  unlockType: "none" | "events"
  unlockCondition: string
  completeType: "none" | "status" | "prompt"
  compeletCondition: string
}

export type EventBook = {
  id: string
  meta: {
    name: string
    author?: string
    author_link?: string
    desp: string
  }
  events: EventBookEvent[]
}

// 扩展角色数据类型以包含事件书（但不包含在导出的角色卡中）
export type ExtendedCharacterData = TavernCardV2 & {
  eventBook?: EventBook
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export type CharacterVersion = {
  id: string
  version: number
  data: TavernCardV2['data']
  timestamp: Date
  label?: string
}

export type CharacterBook = {
  name?: string
  description?: string
  scan_depth?: number // agnai: "Memory: Chat History Depth"
  token_budget?: number // agnai: "Memory: Context Limit"
  recursive_scanning?: boolean // no agnai equivalent. whether entry content can trigger other entries
  extensions: Record<string, any>
  entries: Array<{
    keys: Array<string>
    content: string
    extensions: Record<string, any>
    enabled: boolean
    insertion_order: number // if two entries inserted, lower "insertion order" = inserted higher
    case_sensitive?: boolean

    // FIELDS WITH NO CURRENT EQUIVALENT IN SILLY
    name?: string // not used in prompt engineering
    priority?: number // if token budget reached, lower priority value = discarded first

    // FIELDS WITH NO CURRENT EQUIVALENT IN AGNAI
    id?: number // not used in prompt engineering
    comment?: string // not used in prompt engineering
    selective?: boolean // if `true`, require a key from both `keys` and `secondary_keys` to trigger the entry
    secondary_keys?: Array<string> // see field `selective`. ignored if selective == false
    constant?: boolean // if true, always inserted in the prompt (within budget limit)
    position?: 'before_char' | 'after_char' // whether the entry is placed before or after the character defs
  }>
} 