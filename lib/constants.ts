// Constants for default configurations
export const DEFAULT_CONFIGS = {
  API_BASE_URL: "https://api.siliconflow.cn/v1",
  IMAGE_MODEL: "Qwen/Qwen2.5-VL-72B-Instruct",
  CHAT_MODEL: "deepseek-ai/DeepSeek-V3",
  EVENT_BOOK_MODEL: "deepseek-ai/DeepSeek-V3"
}

// 功能开关
export const FEATURE_FLAGS = {
  SHOW_EVENT_BOOK: false, // 控制是否显示事件书相关UI
}

// 基于界面语言的默认配置
export const LANGUAGE_SPECIFIC_CONFIGS = {
  zh: {
    API_BASE_URL: "https://api.siliconflow.cn/v1",
    IMAGE_MODEL: "Qwen/Qwen2.5-VL-72B-Instruct",
    CHAT_MODEL: "deepseek-ai/DeepSeek-V3",
    EVENT_BOOK_MODEL: "deepseek-ai/DeepSeek-V3",
    FREE_API_KEY_URL: "https://cloud.siliconflow.cn/i/9m9EEgBA",
    API_KEY_PLACEHOLDER: "sk-...",
    API_KEY_LABEL: "硅基流动 API Key"
  },
  en: {
    API_BASE_URL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    IMAGE_MODEL: "gemini-2.0-flash",
    CHAT_MODEL: "gemini-2.0-flash",
    EVENT_BOOK_MODEL: "gemini-2.0-flash",
    FREE_API_KEY_URL: "https://aistudio.google.com/app/apikey",
    API_KEY_PLACEHOLDER: "AIza...",
    API_KEY_LABEL: "Google Gemini API Key"
  }
}

// 根据界面语言获取默认配置
export const getLanguageSpecificConfig = (interfaceLanguage: "zh" | "en") => {
  return LANGUAGE_SPECIFIC_CONFIGS[interfaceLanguage] || LANGUAGE_SPECIFIC_CONFIGS.en
}

// 基于界面语言的模型选项
export const LANGUAGE_SPECIFIC_MODEL_OPTIONS = {
  zh: {
    IMAGE_MODEL_OPTIONS: [
      { value: "Qwen/Qwen2.5-VL-72B-Instruct", label: "Qwen2.5-VL-72B-Instruct" },
      { value: "Qwen/Qwen2.5-VL-32B-Instruct", label: "Qwen2.5-VL-32B-Instruct" },
    ],
    CHAT_MODEL_OPTIONS: [
      { value: "deepseek-ai/DeepSeek-V3", label: "DeepSeek-V3" },
      { value: "Pro/deepseek-ai/DeepSeek-V3", label: "DeepSeek-V3 Pro" },
    ]
  },
  en: {
    IMAGE_MODEL_OPTIONS: [
      { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
      { value: "gemini-2.5-flash-preview-05-20", label: "Gemini 2.5 Flash Preview" },
    ],
    CHAT_MODEL_OPTIONS: [
      { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
      { value: "gemini-2.5-flash-preview-05-20", label: "Gemini 2.5 Flash Preview" },
    ]
  }
}

// 根据界面语言获取模型选项
export const getLanguageSpecificModelOptions = (interfaceLanguage: "zh" | "en") => {
  return LANGUAGE_SPECIFIC_MODEL_OPTIONS[interfaceLanguage] || LANGUAGE_SPECIFIC_MODEL_OPTIONS.en
}

// 常用调整方案
export const ADJUSTMENT_PRESETS = {
  zh: [
    { name: "增加冲突", content: "请帮我增加更多戏剧性冲突和张力，让角色的背景故事更加引人入胜，包含更多情感纠葛和矛盾。" },
    { name: "强化吸引力", content: "请在不违规的前提下，最大化角色和场景的性张力" },
    { name: "轻小说风格", content: "请将角色改造成轻小说风格，增加更多萌属性、日系元素，让对话更加活泼有趣，符合ACG文化特色。" },
    { name: "增强个性", content: "请强化角色的独特个性特征，让角色更加鲜明立体，增加独特的口头禅、行为习惯和性格quirks。" },
    { name: "深化背景", content: "请为角色添加更丰富的背景故事，包括童年经历、重要转折点、人际关系网络等，让角色更有深度。" },
    { name: "优化对话", content: "请优化角色的对话风格和语言习惯，让说话方式更符合角色设定，增加语言的个性化特色。" }
  ],
  en: [
    { name: "Add Conflict", content: "Please help me add more dramatic conflicts and tension to make the character's background story more engaging, including more emotional entanglements and contradictions." },
    { name: "More Attractive", content: "Please make the character more attractive and making the character more appealing to the reader." },
    { name: "Light Novel Style", content: "Please transform the character into a light novel style, adding more moe attributes and Japanese elements, making the dialogue more lively and interesting, fitting ACG culture." },
    { name: "Enhance Personality", content: "Please strengthen the character's unique personality traits, make the character more distinctive and three-dimensional, add unique catchphrases, behavioral habits, and personality quirks." },
    { name: "Deepen Background", content: "Please add a richer background story for the character, including childhood experiences, important turning points, interpersonal networks, etc., to give the character more depth." },
    { name: "Optimize Dialogue", content: "Please optimize the character's dialogue style and language habits, make the speaking style more consistent with the character setting, and add personalized language features." }
  ]
}

// 保留向后兼容的全局模型选项（混合所有选项）
export const IMAGE_MODEL_OPTIONS = [
  // 硅基流动模型
  { value: "Qwen/Qwen2.5-VL-72B-Instruct", label: "Qwen2.5-VL-72B-Instruct" },
  { value: "Qwen/Qwen2.5-VL-32B-Instruct", label: "Qwen2.5-VL-32B-Instruct" },
  // Google Gemini模型
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  
]

export const CHAT_MODEL_OPTIONS = [
  // 硅基流动模型
  { value: "deepseek-ai/DeepSeek-V3", label: "DeepSeek-V3" },
  { value: "Pro/deepseek-ai/DeepSeek-V3", label: "DeepSeek-V3 Pro" },
  // Google Gemini模型
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  
]

export const LANGUAGE_OPTIONS = [
  { value: "zh-CN", label: "中文 (简体)" },
  { value: "zh-TW", label: "中文 (繁體)" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ru", label: "Русский" },
  { value: "custom", label: "Custom / 自定义" },
]

export const INTERFACE_LANGUAGE_OPTIONS = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
] 