"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FileText, MessageSquare, TrendingUp, LogOut, Menu, X } from 'lucide-react'

export default function AppNavbar({ role }: { role: 'buyer' | 'seller' | 'admin' }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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
    <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#0f1011]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-[15px] font-medium tracking-tight" style={{ fontWeight: 510, fontFeatureSettings: '"cv01", "ss03"' }}>
            Reverse<span className="text-[#7170ff]">Drive</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-[13px] transition-all ${
                    isActive
                      ? 'text-[#f7f8f8] bg-white/[0.05]'
                      : 'text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-white/[0.03]'
                  }`}
                  style={{ fontWeight: 510 }}
                >
                  <link.icon size={14} />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right: User menu */}
        <div className="flex items-center gap-3">
          {/* User avatar / name */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-white/[0.05] transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#7170ff] flex items-center justify-center text-[11px] font-medium text-white">
                {userName.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>{userName}</span>
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-[8px] border border-white/[0.08] bg-[#191a1b] shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-[#d0d6e0] hover:bg-white/[0.05] transition-colors"
                    style={{ fontWeight: 510 }}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-[#8a8f98] hover:text-[#f7f8f8] p-1.5 rounded-[6px] hover:bg-white/[0.05] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.05] bg-[#0f1011] px-6 py-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 py-2.5 text-[14px] text-[#d0d6e0] hover:text-[#f7f8f8] transition-colors"
              style={{ fontWeight: 510 }}
              onClick={() => setMenuOpen(false)}
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 py-2.5 text-[14px] text-[#d0d6e0] hover:text-[#f7f8f8] transition-colors"
            style={{ fontWeight: 510 }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  )
}