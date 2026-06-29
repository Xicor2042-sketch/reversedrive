import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppNavbar from '@/components/shared/app-navbar'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Unlock, TrendingUp, Users, FileText, MessageSquare } from 'lucide-react'
import { formatBudget, timeAgo } from '@/lib/utils/cn'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.is_banned) {
    redirect('/login')
  }

  const isSeller = profile.role === 'seller'

  if (isSeller) {
    // Seller Dashboard
    const { data: unlocks } = await supabase
      .from('unlocked_leads')
      .select(`
        id,
        unlock_fee,
        unlocked_at,
        car_requests!inner(make, model, year_min, year_max, max_budget, status)
      `)
      .eq('seller_id', user.id)
      .order('unlocked_at', { ascending: false })

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, type, status, created_at')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const totalSpent = (transactions || [])
      .filter((t: any) => t.status === 'completed')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)

    const totalUnlocks = unlocks?.length || 0

    return (
      <div className="min-h-screen bg-[#0D0F14] text-white">
        <AppNavbar role="seller" />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8">Seller Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Total Unlocks</span>
                <Unlock className="text-[#3B82F6]" size={20} />
              </div>
              <div className="text-3xl font-bold">{totalUnlocks}</div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Total Spent</span>
                <DollarSign className="text-[#10B981]" size={20} />
              </div>
              <div className="text-3xl font-bold">{formatBudget(totalSpent)}</div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Active Leads</span>
                <TrendingUp className="text-[#06B6D4]" size={20} />
              </div>
              <div className="text-3xl font-bold">{totalUnlocks}</div>
            </Card>
          </div>

          <div className="mb-8">
            <Link href="/leads">
              <Button variant="primary" size="lg">
                <TrendingUp size={20} className="mr-2" />
                Browse Lead Board
              </Button>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Unlocked Leads</h2>
            {unlocks && unlocks.length > 0 ? (
              <div className="space-y-3">
                {unlocks.map((unlock: any) => (
                  <Card key={unlock.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {unlock.car_requests?.year_min} {unlock.car_requests?.make} {unlock.car_requests?.model}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          Budget: {formatBudget(unlock.car_requests?.max_budget)} · Unlocked {timeAgo(unlock.unlocked_at)}
                        </div>
                      </div>
                      <Badge variant={unlock.car_requests?.status === 'active' ? 'success' : 'default'}>
                        {unlock.car_requests?.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Users size={40} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">You haven&apos;t unlocked any leads yet.</p>
                <Link href="/leads">
                  <Button variant="secondary" className="mt-4">Browse Available Leads</Button>
                </Link>
              </Card>
            )}
          </div>

          {transactions && transactions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
              <Card className="p-4">
                <div className="space-y-3">
                  {transactions.map((tx: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <div className="text-sm capitalize">{tx.type.replace('_', ' ')}</div>
                        <div className="text-xs text-gray-500">{timeAgo(tx.created_at)}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={tx.status === 'completed' ? 'success' : 'warning'}>
                          {tx.status}
                        </Badge>
                        <span className="font-medium">{formatBudget(parseFloat(tx.amount))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Buyer Dashboard
  const { data: requests } = await supabase
    .from('car_requests')
    .select('*')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  const activeRequests = (requests || []).filter((r: any) => r.status === 'active')

  return (
    <div className="min-h-screen bg-[#0D0F14] text-white">
      <AppNavbar role="buyer" />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Garage</h1>
            <p className="text-sm text-gray-400 mt-1">
              {activeRequests.length} active {activeRequests.length === 1 ? 'request' : 'requests'}
            </p>
          </div>
          <Link href="/requests/new">
            <Button variant="primary" size="lg" className="animate-pulse-neon">
              <FileText size={18} className="mr-2" />
              Create New Request
            </Button>
          </Link>
        </div>

        {requests && requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req: any) => (
              <Card key={req.id} className="p-5 hover:border-[#3B82F6]/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {req.make} {req.model}
                    </h3>
                    <div className="text-sm text-gray-400 mt-1">
                      {req.year_min && req.year_max
                        ? `${req.year_min} - ${req.year_max}`
                        : req.year_min
                        ? `${req.year_min}+`
                        : 'Any year'}
                    </div>
                  </div>
                  <Badge
                    variant={
                      req.status === 'active' ? 'success' :
                      req.status === 'paused' ? 'warning' :
                      req.status === 'expired' ? 'danger' : 'default'
                    }
                  >
                    {req.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-xl font-bold text-[#10B981]">
                    {formatBudget(req.max_budget)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {req.location_zip} · {req.location_radius_miles}mi
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{req.view_count} sellers viewed</span>
                  <span>Expires {timeAgo(req.expires_at)}</span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/requests/${req.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No requests yet</h2>
            <p className="text-gray-400 mb-6">
              Post your first car request and let sellers come to you.
            </p>
            <Link href="/requests/new">
              <Button variant="primary" size="lg">
                Create Your First Request
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}