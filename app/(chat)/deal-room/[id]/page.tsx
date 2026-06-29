"use client"

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Send, ArrowLeft, Paperclip, MoreVertical, Flag } from 'lucide-react'
import { timeAgo } from '@/lib/utils/cn'
import Link from 'next/link'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  attachment_url: string | null
  read_at: string | null
  created_at: string
}

interface Conversation {
  id: string
  request_id: string
  buyer_id: string
  seller_id: string
  status: string
  created_at: string
}

export default function DealRoomPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [otherName, setOtherName] = useState('User')
  const [carInfo, setCarInfo] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeChat()
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initializeChat = async () => {
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
      setLoading(false)
      return
    }
    setConversation(conv)

    // Determine who the other person is and get their name
    const otherId = conv.buyer_id === userData.user.id ? conv.seller_id : conv.buyer_id
    const { data: otherProfile } = await supabase
      .from('profiles')
      .select('display_name, role')
      .eq('id', otherId)
      .single()

    if (otherProfile) {
      // Only show first name for privacy
      setOtherName(otherProfile.display_name.split(' ')[0])
    }

    // Fetch car request for context
    const { data: req } = await supabase
      .from('car_requests')
      .select('make, model, year_min, year_max')
      .eq('id', conv.request_id)
      .single()

    if (req) {
      const yearStr = req.year_min && req.year_max ? `${req.year_min}-${req.year_max}` : ''
      setCarInfo(`${yearStr} ${req.make} ${req.model}`)
    }

    // Fetch existing messages
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', params.id)
      .order('created_at', { ascending: true })

    setMessages(msgs || [])
    setLoading(false)

    // Subscribe to new messages in real-time
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
          // Mark as read if we're the recipient
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
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return

    const tempId = 'temp_' + Date.now()
    const messageData = {
      conversation_id: params.id,
      sender_id: currentUserId,
      content: newMessage.trim(),
    }

    // Optimistic update
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
    setNewMessage('')

    // Send to Supabase
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single()

    if (error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      console.error('Send error:', error)
    } else {
      // Replace optimistic message with real one
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0F14] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-[#0D0F14] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Conversation not found.</p>
          <Link href="/dashboard">
            <Button variant="secondary">Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0F14] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#111827] px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/conversations" className="text-gray-400 hover:text-white">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="font-semibold">{otherName}</div>
              {carInfo && (
                <div className="text-xs text-gray-400">Re: {carInfo}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Flag size={16} className="text-gray-400" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical size={16} className="text-gray-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isOwn = msg.sender_id === currentUserId
                const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          isOwn
                            ? 'bg-[#3B82F6] text-white rounded-br-sm'
                            : 'bg-[#1A1F2E] text-gray-100 rounded-bl-sm border border-white/5'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
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
      <div className="border-t border-white/10 bg-[#111827] px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" className="shrink-0">
            <Paperclip size={20} className="text-gray-400" />
          </Button>
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
            className="flex-1 bg-[#1A1F2E] border border-white/10 rounded-full px-5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6]/50"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            variant="primary"
            size="sm"
            className="shrink-0 rounded-full"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}