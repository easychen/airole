import type { NextRequest } from "next/server"
import OpenAI from "openai"

// 提取JSON内容的函数
function extractJsonFromContent(content: string): string {
  // 移除前后空白
  content = content.trim()
  
  // 检查是否被```json包裹
  const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim()
  }
  
  // 检查是否被```包裹（没有json标识）
  const codeBlockMatch = content.match(/```\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch) {
    const innerContent = codeBlockMatch[1].trim()
    // 检查内容是否看起来像JSON（以{开头，以}结尾）
    if (innerContent.startsWith('{') && innerContent.endsWith('}')) {
      return innerContent
    }
  }
  
  // 尝试直接提取JSON对象
  const directJsonMatch = content.match(/\{[\s\S]*\}/)
  if (directJsonMatch) {
    return directJsonMatch[0]
  }
  
  return content
}

export async function POST(req: NextRequest) {
  try {
    const { image, apiKey, apiBaseUrl = "https://api.siliconflow.cn/v1", model, prompt } = await req.json()

    if (!apiKey) {
      return Response.json({ error: "API key is required" }, { status: 400 })
    }

    if (!image) {
      return Response.json({ error: "Image is required" }, { status: 400 })
    }

    if (!model) {
      return Response.json({ error: "Model is required" }, { status: 400 })
    }

    const analysisPrompt =
      prompt ||
      `Analyze this character image and generate comprehensive character card information for SillyTavern. Based on the visual appearance, clothing, setting, and any other details you can observe, provide detailed information in the following JSON structure:

{
  "name": "A suitable name that fits the character's appearance and style",
  "description": "Detailed physical description including appearance, clothing, notable features, and any visible accessories or items",
  "personality": "Personality traits inferred from visual cues, body language, expression, and overall presentation",
  "scenario": "An engaging initial scenario or setting that matches the character and environment shown",
  "first_mes": "An appropriate first message this character would say, matching their personality and the scenario",
  "mes_example": "Example dialogue showing how this character speaks and interacts, use {{char}} and {{user}} format",
  "tags": ["relevant", "character", "tags", "based", "on", "appearance", "and", "style"]
}

Make the character engaging, consistent, and well-developed. Return ONLY the JSON object, no additional text.`

    // 创建OpenAI客户端
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: apiBaseUrl,
      dangerouslyAllowBrowser: true
    })

    // 调用Vision API
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content:
            "You are a character analysis expert. Analyze images and generate character card data in valid JSON format only. Do not include any text outside the JSON structure.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: analysisPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
      // response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content || "{}"

    try {
      // 解析JSON响应
      const analysis = JSON.parse(extractJsonFromContent(content))

      // 验证必要字段
      const requiredFields = ["name", "description", "personality", "scenario", "first_mes"]
      const missingFields = requiredFields.filter((field) => !analysis[field])

      if (missingFields.length > 0) {
        console.warn("Missing fields:", missingFields)
        // 为缺失字段提供默认值
        if (!analysis.name) analysis.name = "Unknown Character"
        if (!analysis.description) analysis.description = "A mysterious character with an intriguing presence."
        if (!analysis.personality) analysis.personality = "Enigmatic and thoughtful, with hidden depths."
        if (!analysis.scenario) analysis.scenario = "You encounter this character in an unexpected place."
        if (!analysis.first_mes) analysis.first_mes = "Hello there... I don't think we've met before."
      }

      // 确保tags是数组
      if (!Array.isArray(analysis.tags)) {
        analysis.tags = ["mysterious", "intriguing"]
      }

      return Response.json(analysis)
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError)
      console.error("Raw content:", content)
      console.error("Extracted JSON:", extractJsonFromContent(content))

      // 返回默认结构
      return Response.json({
        name: "Unknown Character",
        description: "A mysterious character with an intriguing presence and unique style.",
        personality: "Enigmatic and thoughtful, with hidden depths and a captivating aura.",
        scenario:
          "You encounter this character in an unexpected place, and there's something immediately captivating about their demeanor.",
        first_mes: "Hello there... I don't think we've met before. There's something interesting about you.",
        mes_example:
          "{{char}}: *looks at you with curiosity* You seem different from the others I've met. What brings you here?\n{{user}}: Just exploring, I guess.\n{{char}}: *smiles mysteriously* Exploring can lead to the most fascinating discoveries, don't you think?",
        tags: ["mysterious", "intriguing", "unique"],
      })
    }
  } catch (error) {
    console.error("API Error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
