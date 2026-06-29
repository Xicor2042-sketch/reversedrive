import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, ArrowLeft } from 'lucide-react'
import { timeAgo, cn } from '@/lib/utils/cn'

export default async function ConversationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch conversations where user is buyer or seller
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id,
      buyer_id,
      seller_id,
      status,
      created_at,
      last_message_at,
      car_requests!inner(make, model, year_min, year_max),
      messages(content, created_at, sender_id)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  // Get other user's display name for each conversation
  const conversationsWithNames = await Promise.all(
    (conversations || []).map(async (conv: any) => {
      const otherId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id
      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', otherId)
        .single()

      const lastMessage = conv.messages?.[conv.messages.length - 1]
      const isLastMessageOwn = lastMessage?.sender_id === user.id

      return {
        id: conv.id,
        otherName: otherProfile?.display_name?.split(' ')[0] || 'User',
        carInfo: `${conv.car_requests?.year_min || ''} ${conv.car_requests?.make} ${conv.car_requests?.model}`,
        lastMessage: lastMessage?.content || 'No messages yet',
        lastMessageTime: conv.last_message_at || conv.created_at,
        isLastMessageOwn,
        status: conv.status,
      }
    })
  )

  return (
    <div className="min-h-screen bg-[#0D0F14] text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <ArrowLeft className="text-gray-400 hover:text-white" size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-sm text-gray-400">Your Deal Room conversations</p>
          </div>
        </div>

        {conversationsWithNames.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No conversations yet.</p>
            <p className="text-gray-500 text-sm mt-2">
              Conversations start when a seller unlocks your request (as buyer) or you unlock a lead (as seller).
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversationsWithNames.map((conv) => (
              <Link key={conv.id} href={`/deal-room/${conv.id}`}>
                <Card className="p-4 hover:border-[#3B82F6]/50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{conv.otherName}</span>
                        {conv.status === 'active' && (
                          <Badge variant="success" className="text-xs">Active</Badge>
                        )}
                        {conv.status === 'reported' && (
                          <Badge variant="danger" className="text-xs">Reported</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{conv.carInfo}</div>
                      <div className="text-sm text-gray-400 truncate">
                        {conv.isLastMessageOwn && 'You: '}
                        {conv.lastMessage}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 ml-4 shrink-0">
                      {timeAgo(conv.lastMessageTime)}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}