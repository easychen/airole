import type { NextRequest } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey, apiBaseUrl = "https://api.siliconflow.cn/v1", model } = await req.json()

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!model) {
      return new Response(JSON.stringify({ error: "Model is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // 创建OpenAI客户端
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: apiBaseUrl,
      dangerouslyAllowBrowser: true
    })

    // 创建流式响应
    const stream = await openai.chat.completions.create({
      model: model,
      messages: messages,
      stream: true,
    })

    // 设置响应头
    const headers = new Headers()
    headers.set("Content-Type", "text/plain")
    headers.set("Cache-Control", "no-cache")
    headers.set("Connection", "keep-alive")

    // 创建流式响应
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ""
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
          controller.close()
        } catch (error) {
          console.error("Stream error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers,
    })
  } catch (error) {
    console.error("API Error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
