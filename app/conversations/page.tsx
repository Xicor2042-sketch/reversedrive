import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AppNavbar from '@/components/shared/app-navbar'
import { MessageSquare, ArrowRight } from 'lucide-react'
import { timeAgo } from '@/lib/utils/cn'

export default async function ConversationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Fetch conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id,
      buyer_id,
      seller_id,
      status,
      created_at,
      last_message_at,
      car_requests!inner(make, model, year_min, year_max)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  // Enrich with other user's name and last message
  const enriched = await Promise.all(
    (conversations || []).map(async (conv: any) => {
      const otherId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id
      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', otherId)
        .single()

      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content, sender_id, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const yearStr = conv.car_requests?.year_min && conv.car_requests?.year_max
        ? `${conv.car_requests.year_min}–${conv.car_requests.year_max} `
        : conv.car_requests?.year_min
        ? `${conv.car_requests.year_min}+ `
        : ''

      return {
        id: conv.id,
        otherName: otherProfile?.display_name?.split(' ')[0] || 'User',
        carInfo: `${yearStr}${conv.car_requests?.make} ${conv.car_requests?.model}`,
        lastMessage: lastMsg?.content || 'No messages yet — say hello!',
        lastMessageTime: conv.last_message_at || conv.created_at,
        isLastMessageOwn: lastMsg?.sender_id === user.id,
        status: conv.status,
      }
    })
  )

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <AppNavbar role={(profile?.role as any) || 'buyer'} />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl tracking-tight mb-2" style={{ fontWeight: 510, letterSpacing: '-0.02em' }}>Messages</h1>
        <p className="text-sm text-[#8a8f98] mb-10">
          Your Deal Room conversations
        </p>

        {enriched.length === 0 ? (
          <div className="rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-16 text-center">
            <div className="w-12 h-12 rounded-[10px] bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
              <MessageSquare size={22} className="text-[#62666d]" />
            </div>
            <h2 className="text-lg mb-2" style={{ fontWeight: 510 }}>No conversations yet</h2>
            <p className="text-[13px] text-[#8a8f98] max-w-sm mx-auto">
              Conversations start when a seller unlocks your request (as a buyer) or you unlock a lead (as a seller).
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {enriched.map((conv) => (
              <Link
                key={conv.id}
                href={`/deal-room/${conv.id}`}
                className="block rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all group"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#7170ff] flex items-center justify-center text-[13px] font-medium text-white shrink-0">
                    {conv.otherName.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[14px] truncate" style={{ fontWeight: 510 }}>{conv.otherName}</span>
                      {conv.status === 'active' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      )}
                      {conv.status === 'reported' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#ef4444]/20 bg-[#ef4444]/10 text-[#ef4444]" style={{ fontWeight: 510 }}>Reported</span>
                      )}
                    </div>
                    <div className="text-[12px] text-[#62666d] mb-1">{conv.carInfo}</div>
                    <div className="text-[13px] text-[#8a8f98] truncate">
                      {conv.isLastMessageOwn && 'You: '}
                      {conv.lastMessage}
                    </div>
                  </div>

                  {/* Time + arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#62666d]">{timeAgo(conv.lastMessageTime)}</span>
                    <span className="text-[#7170ff] group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}