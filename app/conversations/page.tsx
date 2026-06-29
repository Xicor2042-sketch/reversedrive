import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import AppNavbar from "@/components/shared/app-navbar"
import { MessageSquare, ArrowRight, User } from "lucide-react"
import { timeAgo } from "@/lib/utils/cn"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ConversationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      id,
      buyer_id,
      seller_id,
      status,
      created_at,
      last_message_at,
      car_requests!inner(id, make, model, year_min, year_max, max_budget, status)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false })

  const enriched = await Promise.all(
    (conversations || []).map(async (conv: any) => {
      const otherId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id
      const [{ data: otherProfile }, { data: lastMsg }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", otherId).single(),
        supabase.from("messages").select("content, sender_id, created_at").eq("conversation_id", conv.id).order("created_at", { ascending: false }).limit(1).single(),
      ])

      const yearStr = conv.car_requests?.year_min && conv.car_requests?.year_max
        ? `${conv.car_requests.year_min}–${conv.car_requests.year_max} `
        : conv.car_requests?.year_min
        ? `${conv.car_requests.year_min}+ `
        : ""

      return {
        id: conv.id,
        otherName: otherProfile?.display_name?.split(" ")[0] || "User",
        otherId,
        carInfo: `${yearStr}${conv.car_requests?.make} ${conv.car_requests?.model}`,
        carBudget: conv.car_requests?.max_budget,
        requestStatus: conv.car_requests?.status,
        requestId: conv.car_requests?.id,
        lastMessage: lastMsg?.content || "No messages yet — say hello!",
        lastMessageTime: conv.last_message_at || conv.created_at,
        isLastMessageOwn: lastMsg?.sender_id === user.id,
        status: conv.status,
        isBuyer: conv.buyer_id === user.id,
      }
    })
  )

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <AppNavbar role={(profile?.role as any) || "buyer"} />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl tracking-tight mb-2" style={{ fontWeight: 510, letterSpacing: "-0.02em" }}>Messages</h1>
          <p className="text-sm text-[#8a8f98]">Your active Deal Room conversations.</p>
        </div>

        {enriched.length === 0 ? (
          <div className="rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-16 text-center">
            <div className="w-12 h-12 rounded-[10px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center mx-auto mb-5">
              <MessageSquare size={22} className="text-[#7170ff]" />
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
                className="block rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#7170ff] flex items-center justify-center text-[14px] text-white shrink-0">
                    {conv.otherName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[15px] truncate" style={{ fontWeight: 510 }}>{conv.otherName}</span>
                      {conv.status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />}
                      {conv.status === "reported" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#ef4444]/20 bg-[#ef4444]/10 text-[#ef4444]" style={{ fontWeight: 510 }}>
                          Reported
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] text-[#62666d]">{conv.carInfo}</span>
                      {conv.carBudget && <span className="text-[11px] text-[#10b981] tabular-nums" style={{ fontWeight: 510 }}>{formatBudget(conv.carBudget)}</span>}
                    </div>
                    <div className="text-[13px] text-[#8a8f98] truncate">
                      {conv.isLastMessageOwn && "You: "}
                      {conv.lastMessage}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
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

function formatBudget(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
}
