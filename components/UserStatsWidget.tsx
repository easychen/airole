"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, Calendar } from 'lucide-react'

interface UserStats {
  total: number
  subscribed: number
  today: number
}

interface UserStatsWidgetProps {
  interfaceLanguage: 'zh' | 'en'
}

export function UserStatsWidget({ interfaceLanguage }: UserStatsWidgetProps) {
  const { data: session } = useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = {
    zh: {
      userStats: '用户统计',
      totalUsers: '总用户数',
      subscribedUsers: '订阅用户',
      todayUsers: '今日新增',
      subscriptionStatus: '邮件订阅状态',
      subscribed: '已订阅',
      unsubscribed: '未订阅',
      updateSubscription: '更新订阅',
      failedToLoad: '加载失败',
      loadingStats: '加载中...',
    },
    en: {
      userStats: 'User Statistics',
      totalUsers: 'Total Users',
      subscribedUsers: 'Subscribed Users',
      todayUsers: 'New Today',
      subscriptionStatus: 'Email Subscription Status',
      subscribed: 'Subscribed',
      unsubscribed: 'Unsubscribed',
      updateSubscription: 'Update Subscription',
      failedToLoad: 'Failed to load',
      loadingStats: 'Loading...',
    }
  }[interfaceLanguage]

  // 获取用户统计信息
  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/users?action=stats')
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // 更新用户订阅状态
  const updateSubscription = async (subscribe: boolean) => {
    if (!session?.user?.email) return

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateSubscription',
          email: session.user.email,
          subscribe,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update subscription')
      }

      // 重新获取统计信息
      fetchStats()
    } catch (err) {
      console.error('Failed to update subscription:', err)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t.userStats}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            {t.loadingStats}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t.userStats}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            {t.failedToLoad}: {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t.userStats}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">{t.totalUsers}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.subscribed}</div>
              <div className="text-sm text-muted-foreground">{t.subscribedUsers}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
              <div className="text-sm text-muted-foreground">{t.todayUsers}</div>
            </div>
          </div>
        )}

        {/* 当前用户的订阅状态 */}
        {session?.user && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t.subscriptionStatus}</span>
              <Badge variant={(session as any).subscribeUpdates ? 'default' : 'secondary'}>
                {(session as any).subscribeUpdates ? t.subscribed : t.unsubscribed}
              </Badge>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => updateSubscription(true)}
                className={`flex-1 px-3 py-1 text-xs rounded transition-colors ${
                  (session as any).subscribeUpdates
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-800'
                }`}
              >
                {t.subscribed}
              </button>
              <button
                onClick={() => updateSubscription(false)}
                className={`flex-1 px-3 py-1 text-xs rounded transition-colors ${
                  !(session as any).subscribeUpdates
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                {t.unsubscribed}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 