"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { default as ReactMarkdown } from 'react-markdown'
import { default as remarkGfm } from 'remark-gfm'

function UserGuideContent() {
  const searchParams = useSearchParams()
  const lang = searchParams.get('lang') || 'en'
  const isZh = lang === 'zh'
  const [markdownContent, setMarkdownContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMarkdown = async () => {
      setIsLoading(true)
      try {
        const fileName = isZh ? 'user-guide-zh.md' : 'user-guide-en.md'
        const response = await fetch(`/docs/${fileName}`)
        const content = await response.text()
        setMarkdownContent(content)
      } catch (error) {
        console.error('Failed to load markdown:', error)
        setMarkdownContent('Failed to load user guide content.')
      } finally {
        setIsLoading(false)
      }
    }

    loadMarkdown()
  }, [isZh])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to AIRole.net
            </Button>
          </Link>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading...</span>
            </div>
          ) : (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a 
                    {...props} 
                    className="text-blue-600 hover:text-blue-800 underline"
                    target={props.href?.startsWith('http') ? '_blank' : undefined}
                    rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  />
                ),
                h1: ({ node, ...props }) => (
                  <h1 {...props} className="text-3xl font-bold text-foreground mb-6" />
                ),
                h2: ({ node, ...props }) => (
                  <h2 {...props} className="text-2xl font-semibold text-foreground mb-4 mt-8" />
                ),
                h3: ({ node, ...props }) => (
                  <h3 {...props} className="text-xl font-medium text-foreground mb-3 mt-6" />
                ),
                p: ({ node, ...props }) => (
                  <p {...props} className="text-foreground mb-4 leading-relaxed" />
                ),
                ul: ({ node, ...props }) => (
                  <ul {...props} className="list-disc list-inside mb-4 space-y-2 text-foreground" />
                ),
                ol: ({ node, ...props }) => (
                  <ol {...props} className="list-decimal list-inside mb-4 space-y-2 text-foreground" />
                ),
                li: ({ node, ...props }) => (
                  <li {...props} className="text-foreground" />
                ),
                strong: ({ node, ...props }) => (
                  <strong {...props} className="font-semibold text-foreground" />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote {...props} className="border-l-4 border-muted-foreground pl-4 italic text-muted-foreground mb-4" />
                ),
                code: ({ node, ...props }) => (
                  <code {...props} className="bg-muted px-1 py-0.5 rounded text-sm font-mono" />
                ),
                pre: ({ node, ...props }) => (
                  <pre {...props} className="bg-muted p-4 rounded-lg overflow-x-auto mb-4" />
                ),
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UserGuidePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <UserGuideContent />
    </Suspense>
  )
} 