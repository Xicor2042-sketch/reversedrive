"use client"

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowLeft, Flag, MoreVertical, Paperclip } from 'lucide-react'
import { timeAgo } from '@/lib/utils/cn'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  attachment_url: string | null
  read_at: string | null
  created_at: string
}

export default function DealRoomPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [otherName, setOtherName] = useState('User')
  const [carInfo, setCarInfo] = useState('')
  const [hasError, setHasError] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeChat()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initializeChat = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }
      setCurrentUserId(userData.user.id)

      // Fetch conversation
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', params.id)
        .single()

      if (convError || !conv) {
        setHasError(true)
        setLoading(false)
        return
      }

      // Get other user's first name
      const otherId = conv.buyer_id === userData.user.id ? conv.seller_id : conv.buyer_id
      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', otherId)
        .single()

      if (otherProfile) {
        setOtherName(otherProfile.display_name.split(' ')[0])
      }

      // Get car info
      const { data: req } = await supabase
        .from('car_requests')
        .select('make, model, year_min, year_max')
        .eq('id', conv.request_id)
        .single()

      if (req) {
        const yearStr = req.year_min && req.year_max ? `${req.year_min}–${req.year_max}` : req.year_min ? `${req.year_min}+ ` : ''
        setCarInfo(`${yearStr}${req.make} ${req.model}`)
      }

      // Fetch messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', params.id)
        .order('created_at', { ascending: true })

      setMessages(msgs || [])
      setLoading(false)

      // Realtime subscription
      const channel = supabase
        .channel(`messages:${params.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${params.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message])
            if ((payload.new as Message).sender_id !== userData.user.id) {
              supabase
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', (payload.new as Message).id)
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } catch (err) {
      console.error('Chat init error:', err)
      setHasError(true)
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return

    const tempId = 'temp_' + Date.now()
    const optimisticMsg: Message = {
      id: tempId,
      conversation_id: params.id,
      sender_id: currentUserId,
      content: newMessage.trim(),
      attachment_url: null,
      read_at: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])
    const messageText = newMessage.trim()
    setNewMessage('')

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: params.id,
        sender_id: currentUserId,
        content: messageText,
      })
      .select()
      .single()

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      console.error('Send error:', error)
    } else {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#5e6ad2] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex items-center justify-center" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
        <div className="text-center max-w-sm">
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
      <div className="border-b border-white/[0.05] bg-[#0f1011]/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/conversations" className="text-[#62666d] hover:text-[#f7f8f8] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#7170ff] flex items-center justify-center text-[12px] font-medium text-white">
            {otherName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-[14px]" style={{ fontWeight: 510 }}>{otherName}</div>
            {carInfo && <div className="text-[11px] text-[#62666d]">Re: {carInfo}</div>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-[6px] hover:bg-white/[0.05] text-[#62666d] hover:text-[#f7f8f8] transition-colors">
            <Flag size={15} />
          </button>
          <button className="p-2 rounded-[6px] hover:bg-white/[0.05] text-[#62666d] hover:text-[#f7f8f8] transition-colors">
            <MoreVertical size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[14px] text-[#62666d] mb-2">No messages yet</p>
              <p className="text-[13px] text-[#8a8f98]">Start the conversation — say hello!</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => {
                const isOwn = msg.sender_id === currentUserId
                const prevMsg = messages[i - 1]
                const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div
                        className={`rounded-[10px] px-4 py-2.5 text-[14px] ${
                          isOwn
                            ? 'bg-[#5e6ad2] text-white rounded-br-sm'
                            : 'bg-white/[0.04] text-[#d0d6e0] border border-white/[0.06] rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className={`text-[10px] text-[#62666d] mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {timeAgo(msg.created_at)}
                        {isOwn && msg.read_at && ' · Read'}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.05] bg-[#0f1011] px-6 py-4 shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <button className="p-2 rounded-[6px] hover:bg-white/[0.05] text-[#62666d] hover:text-[#f7f8f8] transition-colors shrink-0">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Type a message..."
            className="flex-1 rounded-[8px] border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#5e6ad2]/50 focus:outline-none transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-2.5 rounded-[8px] bg-[#5e6ad2] hover:bg-[#7170ff] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}