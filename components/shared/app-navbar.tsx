"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, FileText, MessageSquare, TrendingUp, LogOut, Menu, X } from 'lucide-react'

export default function AppNavbar({ role }: { role: 'buyer' | 'seller' | 'admin' }) {
  const supabase = createClient()
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single()
        if (profile) setUserName(profile.display_name)
      }
    }
    getProfile()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const buyerLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/requests', label: 'My Requests', icon: FileText },
    { href: '/conversations', label: 'Messages', icon: MessageSquare },
  ]

  const sellerLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/leads', label: 'Lead Board', icon: TrendingUp },
    { href: '/conversations', label: 'Messages', icon: MessageSquare },
  ]

  const links = role === 'seller' ? sellerLinks : buyerLinks

  return (
    <nav className="border-b border-white/10 bg-[#111827] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-xl font-bold">
            Reverse<span className="text-[#06B6D4]">Drive</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-gray-400">{userName}</span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
          <button
            className="md:hidden text-gray-400"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}