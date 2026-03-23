'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { adminApi, bookingsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  LayoutDashboard, BookOpen, Calendar, BedDouble,
  Loader2, AlertCircle, LogOut, Shield, ShieldAlert,
  TrendingUp, Users, CheckCircle2, XCircle, Clock,
  ArrowUpDown, Home, ChevronDown, ChevronUp, RefreshCw,
  IndianRupee, Pencil, X, Phone, Wifi, WifiOff
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardData {
  bookings: { total: number; pending: number; confirmed: number; cancelled: number }
  today: { checkIns: number; checkOuts: number }
  revenue: { total: string }
  rooms: { total: number; active: number; maintenance: number }
}

interface BookingGuest {
  fullName: string; phone: string; email?: string
  members?: { id: number; memberName: string }[]
}

interface BookingRoom {
  roomNumber: string; roomType: string; pricePerNight: number
}

interface Booking {
  id: number
  bookingStatus: 'pending' | 'confirmed' | 'cancelled'
  bookingSource: 'online' | 'offline'
  checkIn: string; checkOut: string
  totalGuests: number; totalAmount: number
  notes?: string; createdAt: string
  nights?: number
  guest: BookingGuest
  rooms: BookingRoom[]
  payments: any[]
}

interface TodayData {
  date: string
  checkIns: { total: number; bookings: Booking[] }
  checkOuts: { total: number; bookings: Booking[] }
}

interface Room {
  id: number; roomNumber: string; roomType: string
  maxGuests: number; pricePerNight: number
  status: 'active' | 'maintenance'; description: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const roomType = (t: string) => t === 'premium_plus' ? 'Premium Plus' : 'Premium'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    confirmed: 'bg-green-500/15 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
    active: 'bg-green-500/15 text-green-400 border-green-500/30',
    maintenance: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${map[status] || 'bg-stone-700 text-stone-400 border-stone-600'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function SourceBadge({ source }: { source: string }) {
  return source === 'online'
    ? <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-500/15 text-blue-400 border-blue-500/30 flex items-center gap-1 w-fit"><Wifi className="w-3 h-3" />Online</span>
    : <span className="text-xs px-2 py-0.5 rounded-full border bg-stone-700/50 text-stone-400 border-stone-600 flex items-center gap-1 w-fit"><WifiOff className="w-3 h-3" />Offline</span>
}

function StatCard({ label, value, color, icon: Icon }: {
  label: string; value: string | number; color: string; icon: any
}) {
  return (
    <Card className="bg-stone-900 border-stone-800">
      <CardContent className="p-5 flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-stone-500 text-xs mb-0.5">{label}</p>
          <p className="text-stone-100 text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'bookings', label: 'Booking Requests', Icon: BookOpen },
  { id: 'today', label: 'Today', Icon: Calendar },
  { id: 'rooms', label: 'Rooms', Icon: BedDouble },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth()

  const [activeTab, setActiveTab] = useState('dashboard')

  // Dashboard
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [dashLoading, setDashLoading] = useState(false)
  const [dashError, setDashError] = useState<string | null>(null)

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookLoading, setBookLoading] = useState(false)
  const [bookError, setBookError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')

  // Payment modal
  const [payModal, setPayModal] = useState<Booking | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('Cash')
  const [payTxn, setPayTxn] = useState('')
  const [payLoading, setPayLoading] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Cancel flow
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)

  // Today
  const [today, setToday] = useState<TodayData | null>(null)
  const [todayLoading, setTodayLoading] = useState(false)
  const [todayError, setTodayError] = useState<string | null>(null)

  // Rooms
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [roomsError, setRoomsError] = useState<string | null>(null)
  const [editingRoom, setEditingRoom] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Room>>({})
  const [editLoading, setEditLoading] = useState(false)

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setDashLoading(true); setDashError(null)
    try {
      const res = await adminApi.getDashboard()
      setDashboard(res.data.data)
    } catch (e: any) { setDashError(e?.response?.data?.message || 'Failed to load dashboard.') }
    finally { setDashLoading(false) }
  }, [])

  const fetchBookings = useCallback(async () => {
    setBookLoading(true); setBookError(null)
    try {
      const filters: any = {}
      if (statusFilter !== 'all') filters.status = statusFilter
      if (sourceFilter !== 'all') filters.source = sourceFilter
      const res = await adminApi.getAllBookings(filters)
      setBookings(res.data.data?.bookings || res.data.data || [])
    } catch (e: any) { setBookError(e?.response?.data?.message || 'Failed to load bookings.') }
    finally { setBookLoading(false) }
  }, [statusFilter, sourceFilter])

  const fetchToday = useCallback(async () => {
    setTodayLoading(true); setTodayError(null)
    try {
      const res = await adminApi.getTodayActivity()
      setToday(res.data.data)
    } catch (e: any) { setTodayError(e?.response?.data?.message || 'Failed to load today\'s activity.') }
    finally { setTodayLoading(false) }
  }, [])

  const fetchRooms = useCallback(async () => {
    setRoomsLoading(true); setRoomsError(null)
    try {
      const res = await adminApi.getAllRooms()
      setRooms(res.data.data?.rooms || res.data.data || [])
    } catch (e: any) { setRoomsError(e?.response?.data?.message || 'Failed to load rooms.') }
    finally { setRoomsLoading(false) }
  }, [])

  useEffect(() => { if (activeTab === 'dashboard') fetchDashboard() }, [activeTab, fetchDashboard])
  useEffect(() => { if (activeTab === 'bookings') fetchBookings() }, [activeTab, fetchBookings])
  useEffect(() => { if (activeTab === 'today') fetchToday() }, [activeTab, fetchToday])
  useEffect(() => { if (activeTab === 'rooms') fetchRooms() }, [activeTab, fetchRooms])

  // ── Confirm Payment ────────────────────────────────────────────────────────
  const openPayModal = (b: Booking) => {
    setPayModal(b)
    setPayAmount(String(b.totalAmount))
    setPayMethod('Cash')
    setPayTxn('')
    setPayError(null)
  }

  const handleConfirmPayment = async () => {
    if (!payModal) return
    setPayLoading(true); setPayError(null)
    try {
      await bookingsApi.confirmPayment(
        payModal.id,
        Number(payAmount),
        payMethod,
        payTxn || undefined
      )
      setPayModal(null)
      setSuccessMsg(`Booking #${payModal.id} confirmed!`)
      setTimeout(() => setSuccessMsg(null), 4000)
      fetchBookings()
    } catch (e: any) {
      setPayError(e?.response?.data?.message || 'Payment confirmation failed.')
    } finally { setPayLoading(false) }
  }

  // ── Cancel Booking ─────────────────────────────────────────────────────────
  const handleCancelBooking = async (id: number) => {
    setCancelLoading(true)
    try {
      await adminApi.cancelBooking(id, cancelReason || undefined)
      setCancelId(null); setCancelReason('')
      setSuccessMsg(`Booking #${id} cancelled.`)
      setTimeout(() => setSuccessMsg(null), 4000)
      fetchBookings()
    } catch (e: any) {
      setBookError(e?.response?.data?.message || 'Cancellation failed.')
    } finally { setCancelLoading(false) }
  }

  // ── Room Edit ──────────────────────────────────────────────────────────────
  const startEdit = (room: Room) => {
    setEditingRoom(room.id)
    setEditForm({ pricePerNight: room.pricePerNight, status: room.status, maxGuests: room.maxGuests, description: room.description })
  }

  const handleSaveRoom = async (id: number) => {
    setEditLoading(true)
    try {
      await adminApi.updateRoom(id, editForm)
      setEditingRoom(null)
      fetchRooms()
    } catch (e: any) { setRoomsError(e?.response?.data?.message || 'Failed to update room.') }
    finally { setEditLoading(false) }
  }

  // ── Loading / Access states ────────────────────────────────────────────────
  if (authLoading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
    </div>
  )

  if (!isAuthenticated) return null // redirect in progress

  if (user?.role === 'guest') return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-light text-stone-100 mb-2">Access Denied</h1>
        <p className="text-stone-500 mb-6 text-sm">You don't have permission to view the admin panel. This area is restricted to staff only.</p>
        <Link href="/"><Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"><Home className="w-4 h-4 mr-2" /> Go to Homepage</Button></Link>
      </motion.div>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN PANEL
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">

      {/* Header */}
      <div className="border-b border-stone-800 bg-stone-900/70 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-stone-100 leading-none">MHomes Admin Panel</h1>
              <p className="text-xs text-stone-500 mt-0.5">Welcome, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${user?.role === 'admin' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              }`}>
              {user?.role === 'admin' ? 'Admin' : 'Reception'}
            </span>
            <Button variant="outline" size="sm" onClick={logout}
              className="border-stone-700 text-stone-400 hover:border-red-800 hover:text-red-400 text-xs">
              <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-green-900/90 border border-green-700 text-green-300 text-sm px-6 py-3 rounded-xl shadow-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment modal */}
      <AnimatePresence>
        {payModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setPayModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-lg font-semibold text-stone-100">Record Offline Payment</h2>
                <button onClick={() => setPayModal(null)} className="text-stone-600 hover:text-stone-300"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-stone-500 text-sm mb-5">Payment was collected offline. Enter details below.</p>

              <div className="space-y-4">
                <div>
                  <Label className="text-stone-400 text-sm mb-1.5 block">Amount (₹)</Label>
                  <Input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                    className="bg-stone-800 border-stone-700 text-stone-100 focus:border-amber-500" />
                </div>
                <div>
                  <Label className="text-stone-400 text-sm mb-1.5 block">Payment Method</Label>
                  <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                    className="w-full rounded-md px-3 py-2 bg-stone-800 border border-stone-700 text-stone-100 focus:border-amber-500 focus:outline-none text-sm">
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div>
                  <Label className="text-stone-400 text-sm mb-1.5 block">UPI Ref / Transaction ID <span className="text-stone-600 font-normal">(optional)</span></Label>
                  <Input value={payTxn} onChange={e => setPayTxn(e.target.value)} placeholder="e.g. UPI123456"
                    className="bg-stone-800 border-stone-700 text-stone-100 focus:border-amber-500" />
                </div>
                {payError && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2"><AlertCircle className="w-4 h-4 shrink-0" />{payError}</div>}
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setPayModal(null)} className="flex-1 border-stone-700 text-stone-400 hover:border-stone-600">Cancel</Button>
                <Button onClick={handleConfirmPayment} disabled={payLoading}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold">
                  {payLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing…</> : 'Confirm Payment'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Tab nav */}
        <div className="flex gap-1 bg-stone-900/60 border border-stone-800 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === id ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400' : 'text-stone-500 hover:text-stone-300'
                }`}>
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

            {/* ─── TAB 1: DASHBOARD ──────────────────────────────────────── */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-stone-100">Overview</h2>
                  <Button variant="outline" size="sm" onClick={fetchDashboard} className="border-stone-700 text-stone-500 hover:border-stone-600 text-xs">
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
                  </Button>
                </div>
                {dashLoading ? <Spinner /> : dashError ? <ErrBox msg={dashError} /> : dashboard && (
                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-widest text-stone-600 font-medium">Booking Requests</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <StatCard label="Total Requests" value={dashboard.bookings.total} color="bg-stone-800 text-stone-400" icon={BookOpen} />
                      <StatCard label="Pending" value={dashboard.bookings.pending} color="bg-amber-500/15 text-amber-400" icon={Clock} />
                      <StatCard label="Confirmed" value={dashboard.bookings.confirmed} color="bg-green-500/15 text-green-400" icon={CheckCircle2} />
                      <StatCard label="Cancelled" value={dashboard.bookings.cancelled} color="bg-red-500/15 text-red-400" icon={XCircle} />
                    </div>
                    <p className="text-xs uppercase tracking-widest text-stone-600 font-medium pt-2">Today</p>
                    <div className="grid grid-cols-2 gap-3">
                      <StatCard label="Check-ins Today" value={dashboard.today.checkIns} color="bg-blue-500/15 text-blue-400" icon={ArrowUpDown} />
                      <StatCard label="Check-outs Today" value={dashboard.today.checkOuts} color="bg-purple-500/15 text-purple-400" icon={ArrowUpDown} />
                    </div>
                    <p className="text-xs uppercase tracking-widest text-stone-600 font-medium pt-2">Property</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <StatCard label="Total Revenue" value={fmt(Number(dashboard.revenue.total))} color="bg-amber-500/15 text-amber-400" icon={IndianRupee} />
                      <StatCard label="Active Rooms" value={dashboard.rooms.active} color="bg-green-500/15 text-green-400" icon={BedDouble} />
                      <StatCard label="Under Maintenance" value={dashboard.rooms.maintenance} color="bg-orange-500/15 text-orange-400" icon={TrendingUp} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 2: BOOKING REQUESTS ───────────────────────────────── */}
            {activeTab === 'bookings' && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <h2 className="text-lg font-semibold text-stone-100">Booking Requests</h2>
                  <div className="flex gap-2 flex-wrap">
                    {/* Status filter */}
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-300 focus:border-amber-500 focus:outline-none">
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {/* Source filter */}
                    <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-300 focus:border-amber-500 focus:outline-none">
                      <option value="all">All Sources</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={fetchBookings} className="border-stone-700 text-stone-500 hover:border-stone-600 text-xs h-7">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {bookLoading ? <Spinner /> : bookError ? <ErrBox msg={bookError} /> : bookings.length === 0 ? (
                  <div className="text-center py-16 text-stone-600">No bookings found.</div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map(b => (
                      <Card key={b.id} className="bg-stone-900 border-stone-800 overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-4 sm:p-5">
                            {/* Top row */}
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-bold text-amber-400 text-base">#{b.id}</span>
                                <StatusBadge status={b.bookingStatus} />
                                <SourceBadge source={b.bookingSource} />
                              </div>
                              <span className="text-stone-600 text-xs">{fmtDate(b.createdAt)}</span>
                            </div>

                            {/* Details grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm mb-4">
                              <div>
                                <p className="text-stone-500 text-xs">Guest</p>
                                <p className="text-stone-200 font-medium">{b.guest.fullName}</p>
                                <p className="text-stone-500 text-xs flex items-center gap-1"><Phone className="w-3 h-3" />{b.guest.phone}</p>
                              </div>
                              <div>
                                <p className="text-stone-500 text-xs">Rooms</p>
                                <p className="text-stone-200 font-medium">{b.rooms.map(r => r.roomNumber).join(', ')}</p>
                                <p className="text-stone-500 text-xs">{b.rooms.map(r => roomType(r.roomType)).join(', ')}</p>
                              </div>
                              <div>
                                <p className="text-stone-500 text-xs">Dates</p>
                                <p className="text-stone-200 text-xs">{fmtDate(b.checkIn)}</p>
                                <p className="text-stone-500 text-xs">→ {fmtDate(b.checkOut)}</p>
                                {b.nights && <p className="text-stone-600 text-xs">{b.nights} nights</p>}
                              </div>
                              <div>
                                <p className="text-stone-500 text-xs">Amount</p>
                                <p className="text-amber-400 font-bold text-base">{fmt(b.totalAmount)}</p>
                                <p className="text-stone-600 text-xs">{b.totalGuests} guest{b.totalGuests > 1 ? 's' : ''}</p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 border-t border-stone-800 pt-3">
                              {b.bookingStatus === 'pending' && (
                                <Button size="sm" onClick={() => openPayModal(b)}
                                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs h-8">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm & Record Payment
                                </Button>
                              )}
                              {(b.bookingStatus === 'pending' || b.bookingStatus === 'confirmed') && (
                                cancelId === b.id ? (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Input value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                                      placeholder="Reason (optional)"
                                      className="text-xs h-8 bg-stone-800 border-stone-700 text-stone-200 focus:border-red-600 w-44" />
                                    <Button size="sm" onClick={() => handleCancelBooking(b.id)} disabled={cancelLoading}
                                      className="text-xs h-8 bg-red-900/60 hover:bg-red-900 border border-red-800 text-red-300">
                                      {cancelLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Yes, Cancel'}
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => { setCancelId(null); setCancelReason('') }}
                                      className="text-xs h-8 border-stone-700 text-stone-400">No</Button>
                                  </div>
                                ) : (
                                  <Button size="sm" variant="outline" onClick={() => { setCancelId(b.id); setCancelReason('') }}
                                    className="text-xs h-8 border-stone-700 text-stone-400 hover:border-red-800 hover:text-red-400">
                                    <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel Booking
                                  </Button>
                                )
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 3: TODAY ──────────────────────────────────────────── */}
            {activeTab === 'today' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-stone-100">
                    Today — {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </h2>
                  <Button variant="outline" size="sm" onClick={fetchToday} className="border-stone-700 text-stone-500 hover:border-stone-600 text-xs">
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
                  </Button>
                </div>
                {todayLoading ? <Spinner /> : todayError ? <ErrBox msg={todayError} /> : today && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Check-ins */}
                    <div>
                      <h3 className="flex items-center gap-2 text-blue-400 font-medium mb-3">
                        <ArrowUpDown className="w-4 h-4" /> Check-ins Today ({today.checkIns.total})
                      </h3>
                      {today.checkIns.bookings.length === 0 ? (
                        <div className="text-stone-600 text-sm py-8 text-center border border-stone-800 rounded-xl bg-stone-900/40">No check-ins today</div>
                      ) : (
                        <div className="space-y-3">
                          {today.checkIns.bookings.map(b => <TodayCard key={b.id} booking={b} />)}
                        </div>
                      )}
                    </div>
                    {/* Check-outs */}
                    <div>
                      <h3 className="flex items-center gap-2 text-purple-400 font-medium mb-3">
                        <ArrowUpDown className="w-4 h-4" /> Check-outs Today ({today.checkOuts.total})
                      </h3>
                      {today.checkOuts.bookings.length === 0 ? (
                        <div className="text-stone-600 text-sm py-8 text-center border border-stone-800 rounded-xl bg-stone-900/40">No check-outs today</div>
                      ) : (
                        <div className="space-y-3">
                          {today.checkOuts.bookings.map(b => <TodayCard key={b.id} booking={b} />)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 4: ROOMS ──────────────────────────────────────────── */}
            {activeTab === 'rooms' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-stone-100">Rooms</h2>
                  <Button variant="outline" size="sm" onClick={fetchRooms} className="border-stone-700 text-stone-500 hover:border-stone-600 text-xs">
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
                  </Button>
                </div>
                {roomsLoading ? <Spinner /> : roomsError ? <ErrBox msg={roomsError} /> : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms.map(room => (
                      <Card key={room.id} className="bg-stone-900 border-stone-800">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-2xl font-bold text-stone-100">{room.roomNumber}</p>
                              <p className="text-xs text-stone-500 mt-0.5">{roomType(room.roomType)}</p>
                            </div>
                            <StatusBadge status={room.status} />
                          </div>
                          <div className="flex gap-4 text-sm mb-4">
                            <span className="text-stone-400"><span className="text-stone-600 text-xs">Max guests</span><br />{room.maxGuests}</span>
                            <span className="text-amber-400 font-semibold"><span className="text-stone-600 text-xs block font-normal">Per night</span>{fmt(room.pricePerNight)}</span>
                          </div>
                          <p className="text-stone-500 text-xs mb-4 line-clamp-2">{room.description}</p>

                          {/* Edit (admin only) */}
                          {user?.role === 'admin' && (
                            editingRoom === room.id ? (
                              <div className="space-y-3 border-t border-stone-800 pt-4">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-stone-500 text-xs mb-1 block">Price/night (₹)</Label>
                                    <Input type="number" value={editForm.pricePerNight || ''} onChange={e => setEditForm(p => ({ ...p, pricePerNight: Number(e.target.value) }))}
                                      className="text-sm h-8 bg-stone-800 border-stone-700 text-stone-100 focus:border-amber-500" />
                                  </div>
                                  <div>
                                    <Label className="text-stone-500 text-xs mb-1 block">Max guests</Label>
                                    <Input type="number" value={editForm.maxGuests || ''} onChange={e => setEditForm(p => ({ ...p, maxGuests: Number(e.target.value) }))}
                                      className="text-sm h-8 bg-stone-800 border-stone-700 text-stone-100 focus:border-amber-500" />
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-stone-500 text-xs mb-1 block">Status</Label>
                                  <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as any }))}
                                    className="w-full text-sm h-8 px-2 rounded bg-stone-800 border border-stone-700 text-stone-100 focus:border-amber-500 focus:outline-none">
                                    <option value="active">Active</option>
                                    <option value="maintenance">Maintenance</option>
                                  </select>
                                </div>
                                <div>
                                  <Label className="text-stone-500 text-xs mb-1 block">Description</Label>
                                  <textarea value={editForm.description || ''} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={2}
                                    className="w-full text-sm px-2 py-1.5 rounded bg-stone-800 border border-stone-700 text-stone-100 focus:border-amber-500 focus:outline-none resize-none" />
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleSaveRoom(room.id)} disabled={editLoading}
                                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs h-7">
                                    {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Changes'}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingRoom(null)}
                                    className="border-stone-700 text-stone-400 text-xs h-7">Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => startEdit(room)}
                                className="w-full border-stone-700 text-stone-400 hover:border-amber-500 hover:text-amber-400 text-xs h-8">
                                <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Room
                              </Button>
                            )
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Helper components ────────────────────────────────────────────────────────

function Spinner() {
  return <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-amber-500" /></div>
}

function ErrBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/50 border border-red-800/50 rounded-xl px-4 py-3 max-w-lg">
      <AlertCircle className="w-4 h-4 shrink-0" />{msg}
    </div>
  )
}

function TodayCard({ booking: b }: { booking: Booking }) {
  return (
    <Card className="bg-stone-900 border-stone-800">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-amber-400">#{b.id}</span>
          <StatusBadge status={b.bookingStatus} />
        </div>
        <p className="text-stone-200 font-medium text-sm">{b.guest.fullName}</p>
        <p className="text-stone-500 text-xs flex items-center gap-1"><Phone className="w-3 h-3" />{b.guest.phone}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-400 text-xs">Rooms: <span className="text-stone-200">{b.rooms.map(r => r.roomNumber).join(', ')}</span></span>
          <span className="text-stone-500 text-xs"><Users className="w-3 h-3 inline mr-0.5" />{b.totalGuests}</span>
        </div>
        <p className="text-amber-400 font-semibold text-sm">{fmt(b.totalAmount)}</p>
      </CardContent>
    </Card>
  )
}
