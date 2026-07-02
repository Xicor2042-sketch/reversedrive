"use client"

import { use, useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Send,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCheck,
} from "lucide-react"
import { timeAgo } from "@/lib/utils/cn"

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  attachment_url: string | null
  read_at: string | null
  created_at: string
}

export default function DealRoomPage({ params }: { params: Promise<{ id: string }> }) {
  // Next 16: params is a Promise in client pages — reading conversationId directly
  // yields undefined and every conversation looked "not found".
  const { id: conversationId } = use(params)
  const supabase = createClient()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUserId, setCurrentUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const [otherName, setOtherName] = useState("User")
  const [carInfo, setCarInfo] = useState("")
  const [hasError, setHasError] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeChat()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const initializeChat = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push("/login")
        return
      }
      setCurrentUserId(userData.user.id)

      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single()

      if (convError || !conv) {
        setHasError(true)
        setLoading(false)
        return
      }

      const otherId = conv.buyer_id === userData.user.id ? conv.seller_id : conv.buyer_id
      // profiles RLS only allows reading your own row — cross-user names come
      // from the public_profiles view (public columns only).
      const { data: otherProfile } = await supabase
        .from("public_profiles")
        .select("display_name, dealer_business_name")
        .eq("id", otherId)
        .single()

      if (otherProfile?.display_name) {
        setOtherName(otherProfile.dealer_business_name || otherProfile.display_name.split(" ")[0])
      }

      const { data: req } = await supabase
        .from("car_requests")
        .select("make, model, year_min, year_max, max_budget, status")
        .eq("id", conv.request_id)
        .single()

      if (req) {
        const yearStr = req.year_min && req.year_max ? `${req.year_min}–${req.year_max} ` : req.year_min ? `${req.year_min}+ ` : ""
        setCarInfo(`${yearStr}${req.make} ${req.model}`)
      }

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      setMessages(msgs || [])
      setLoading(false)

      const channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const incoming = payload.new as Message
            setMessages((prev) => {
              if (prev.find((m) => m.id === incoming.id)) return prev
              return [...prev, incoming]
            })
            if (incoming.sender_id !== userData.user.id) {
              supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", incoming.id)
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } catch (err) {
      console.error("Chat init error:", err)
      setHasError(true)
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || sending) return
    setSending(true)

    const tempId = "temp_" + Date.now()
    const optimisticMsg: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: newMessage.trim(),
      attachment_url: null,
      read_at: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])
    const messageText = newMessage.trim()
    setNewMessage("")

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: messageText,
      })
      .select()
      .single()

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      console.error("Send error:", error)
    } else {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)))
    }
    setSending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#5e6ad2]" size={26} />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex items-center justify-center" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
        <div className="text-center max-w-sm px-6">
          <AlertCircle size={28} className="mx-auto text-[#ef4444] mb-4" />
          <p className="text-[15px] text-[#d0d6e0] mb-4" style={{ fontWeight: 510 }}>Conversation not found</p>
          <Link href="/conversations" className="inline-flex items-center gap-2 text-[13px] text-[#7170ff] hover:text-[#828fff]" style={{ fontWeight: 510 }}>
            <ArrowLeft size={14} /> Back to Messages
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#08090a] text-[#f7f8f8] flex flex-col" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      {/* Header */}
      <div className="border-b border-white/[0.05] bg-[#0f1011]/80 backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/conversations" className="text-[#62666d] hover:text-[#f7f8f8] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#7170ff] flex items-center justify-center text-[12px] text-white">
            {otherName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-[14px] truncate" style={{ fontWeight: 510 }}>{otherName}</div>
            {carInfo && <div className="text-[11px] text-[#62666d] truncate">Re: {carInfo}</div>}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#62666d]" style={{ fontWeight: 510 }}>
          <ShieldCheck size={13} className="text-[#10b981]" />
          Private Deal Room
        </div>
      </div>

      {/* Trust banner */}
      <div className="border-b border-white/[0.05] bg-[#5e6ad2]/[0.03] px-4 sm:px-6 py-2.5 shrink-0">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2 text-[12px] text-[#8a8f98]">
          <ShieldCheck size={13} className="text-[#10b981]" />
          <span>Protected by ReverseDrive. Never share bank details in chat.</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                <Send size={20} className="text-[#62666d]" />
              </div>
              <p className="text-[15px] text-[#d0d6e0] mb-1" style={{ fontWeight: 510 }}>No messages yet</p>
              <p className="text-[13px] text-[#8a8f98]">Start the conversation — say hello!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isOwn = msg.sender_id === currentUserId
              const prevMsg = messages[i - 1]
              const nextMsg = messages[i + 1]
              const showHeader = !prevMsg || prevMsg.sender_id !== msg.sender_id
              const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id

              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} ${showHeader ? "mt-2" : "mt-0.5"}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[75%] flex ${isOwn ? "flex-row-reverse" : "flex-row"} items-end gap-2`}>
                    {!isOwn && showHeader && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#7170ff] flex items-center justify-center text-[10px] text-white shrink-0">
                        {otherName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {!isOwn && !showHeader && <div className="w-7 shrink-0" />}

                    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                      <div
                        className={`rounded-[14px] px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                          isOwn
                            ? "bg-[#5e6ad2] text-white rounded-br-[4px]"
                            : "bg-white/[0.04] text-[#d0d6e0] border border-white/[0.06] rounded-bl-[4px]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {isLastInGroup && (
                        <div className={`text-[10px] text-[#62666d] mt-1 px-2 flex items-center gap-1`}>
                          {timeAgo(msg.created_at)}
                          {isOwn && (msg.read_at ? <CheckCheck size={10} className="text-[#10b981]" /> : <CheckCheck size={10} />)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.05] bg-[#0f1011] px-4 sm:px-6 py-4 shrink-0">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 min-h-[44px] max-h-32 rounded-[10px] border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#5e6ad2]/50 focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/20 transition-all resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="p-2.5 rounded-[10px] bg-[#5e6ad2] hover:bg-[#7170ff] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
