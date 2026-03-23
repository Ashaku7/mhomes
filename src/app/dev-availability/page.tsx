'use client'

import { useState } from 'react'
import api from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AvailableRoom {
  id: number; roomNumber: string; roomType: string; pricePerNight: number; maxGuests: number; totalPrice: number
}
interface AvailabilityResult {
  checkIn: string; checkOut: string; nights: number; totalAvailable: number
  roomsByType: Record<string, { rooms: AvailableRoom[]; count: number; pricePerNight: number }>
}

interface BookingRoom { roomNumber: string; roomType: string }
interface Booking {
  id: number; bookingStatus: string; bookingSource: string
  checkIn: string; checkOut: string; totalAmount: number; createdAt: string
  rooms: BookingRoom[]
}

interface OverlapCheck {
  room: string
  available: boolean
  blockedBy: { bookingId: number; checkIn: string; checkOut: string; status: string; c1: boolean; c2: boolean }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const isoDate = (iso: string) => iso.split('T')[0]

function computeOverlap(
  bookings: Booking[],
  searchCheckIn: string,
  searchCheckOut: string,
  ignorePending: boolean
): OverlapCheck[] {
  const A = new Date(searchCheckIn)
  const B = new Date(searchCheckOut)

  const allRoomNumbers = Array.from(
    new Set(bookings.flatMap(b => b.rooms.map(r => r.roomNumber)))
  ).sort()

  return allRoomNumbers.map(roomNum => {
    const relevant = bookings.filter(b => {
      if (ignorePending && b.bookingStatus === 'pending') return false
      if (b.bookingStatus === 'cancelled') return false
      return b.rooms.some(r => r.roomNumber === roomNum)
    })

    const blockedBy = relevant.map(b => {
      const X = new Date(b.checkIn)
      const Y = new Date(b.checkOut)
      const c1 = X < B          // existing.checkIn < search.checkOut
      const c2 = Y > A          // existing.checkOut > search.checkIn
      return { bookingId: b.id, checkIn: b.checkIn, checkOut: b.checkOut, status: b.bookingStatus, c1, c2 }
    }).filter(b => b.c1 && b.c2)

    return { room: roomNum, available: blockedBy.length === 0, blockedBy }
  })
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DevAvailabilityPage() {
  const today = new Date().toISOString().split('T')[0]

  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [ignorePending, setIgnorePending] = useState(false)

  const [availability, setAvailability] = useState<AvailabilityResult | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [overlapDebug, setOverlapDebug] = useState<OverlapCheck[]>([])

  const [loadingAvail, setLoadingAvail] = useState(false)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [loadingCancel, setLoadingCancel] = useState(false)

  const [availError, setAvailError] = useState<string | null>(null)
  const [bookingsError, setBookingsError] = useState<string | null>(null)
  const [cancelMsg, setCancelMsg] = useState<string | null>(null)

  // ── Fetch available rooms ─────────────────────────────────────────────────
  const fetchAvailability = async () => {
    if (!checkIn || !checkOut) { setAvailError('Please set both dates.'); return }
    setLoadingAvail(true); setAvailError(null); setAvailability(null)
    try {
      const res = await api.get('/api/rooms/available', { params: { checkIn, checkOut, guests } })
      setAvailability(res.data.data)
    } catch (e: any) {
      setAvailError(e?.response?.data?.message || 'Failed to fetch availability.')
    } finally { setLoadingAvail(false) }
  }

  // ── Fetch all bookings ────────────────────────────────────────────────────
  const fetchBookings = async () => {
    setLoadingBookings(true); setBookingsError(null)
    try {
      const res = await api.get('/api/admin/bookings')
      const raw = res.data.data?.bookings || res.data.data || []
      setBookings(raw)
      if (checkIn && checkOut) {
        setOverlapDebug(computeOverlap(raw, checkIn, checkOut, ignorePending))
      }
    } catch (e: any) {
      setBookingsError(e?.response?.data?.message || 'Failed to fetch bookings. Are you logged in as admin?')
    } finally { setLoadingBookings(false) }
  }

  // ── Recompute overlap when toggle changes ─────────────────────────────────
  const recompute = (ip: boolean) => {
    setIgnorePending(ip)
    if (bookings.length && checkIn && checkOut) {
      setOverlapDebug(computeOverlap(bookings, checkIn, checkOut, ip))
    }
  }

  // ── Cancel all pending bookings ────────────────────────────────────────────
  const cancelAllPending = async () => {
    const pending = bookings.filter(b => b.bookingStatus === 'pending')
    if (pending.length === 0) { setCancelMsg('No pending bookings to cancel.'); return }
    setLoadingCancel(true); setCancelMsg(null)
    try {
      await Promise.all(pending.map(b => api.patch(`/api/admin/bookings/${b.id}/cancel`, { reason: 'Dev debug reset' })))
      setCancelMsg(`Cancelled ${pending.length} pending booking(s). Refresh bookings to see changes.`)
      fetchBookings()
    } catch (e: any) {
      setCancelMsg('Error: ' + (e?.response?.data?.message || e.message))
    } finally { setLoadingCancel(false) }
  }

  const statusColor = (s: string) =>
    s === 'confirmed' ? 'bg-green-800 text-green-200' :
      s === 'pending' ? 'bg-yellow-800 text-yellow-200' :
        'bg-stone-700 text-stone-400'

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-6 font-mono text-sm">
      <h1 className="text-2xl font-bold text-amber-400 mb-1">🔍 Availability Debug Tool</h1>
      <p className="text-stone-500 text-xs mb-6">Dev-only page — not for production</p>

      {/* ── SEARCH INPUTS ─────────────────────────────────────────────────── */}
      <section className="bg-stone-900 border border-stone-800 rounded-xl p-5 mb-6">
        <h2 className="text-amber-300 font-semibold mb-3">1. Search Inputs</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-stone-500 text-xs mb-1">Check-in</label>
            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
              className="bg-stone-800 border border-stone-700 text-stone-100 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-stone-500 text-xs mb-1">Check-out</label>
            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
              className="bg-stone-800 border border-stone-700 text-stone-100 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-stone-500 text-xs mb-1">Guests</label>
            <input type="number" min={1} max={10} value={guests} onChange={e => setGuests(Number(e.target.value))}
              className="bg-stone-800 border border-stone-700 text-stone-100 rounded px-3 py-2 text-sm w-20" />
          </div>
          <button onClick={fetchAvailability} disabled={loadingAvail}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-5 py-2 rounded disabled:opacity-50">
            {loadingAvail ? 'Checking…' : 'Check Availability'}
          </button>
          <button onClick={fetchBookings} disabled={loadingBookings}
            className="bg-blue-700 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded disabled:opacity-50">
            {loadingBookings ? 'Loading…' : 'Load All Bookings'}
          </button>
        </div>
        {availError && <p className="text-red-400 mt-3">❌ {availError}</p>}
      </section>

      {/* ── AVAILABLE ROOMS ───────────────────────────────────────────────── */}
      {availability && (
        <section className="bg-stone-900 border border-stone-800 rounded-xl p-5 mb-6">
          <h2 className="text-amber-300 font-semibold mb-3">2. Available Rooms
            <span className={`ml-3 text-base font-bold ${availability.totalAvailable > 0 ? 'text-green-400' : 'text-red-400'}`}>
              ({availability.totalAvailable} total)
            </span>
          </h2>
          <p className="text-stone-500 text-xs mb-3">{availability.checkIn} → {availability.checkOut} · {availability.nights} night(s) · {guests} guest(s)</p>

          {availability.totalAvailable === 0 ? (
            <p className="text-red-400">⚠️ No rooms available — check the overlap debug below.</p>
          ) : (
            Object.entries(availability.roomsByType).map(([type, group]) => (
              <div key={type} className="mb-4">
                <p className="text-stone-400 text-xs uppercase tracking-widest mb-2">{type} — {group.count} room(s)</p>
                <table className="w-full border-collapse text-xs">
                  <thead><tr className="text-stone-600 border-b border-stone-800">
                    <th className="text-left py-1 pr-4">Room</th>
                    <th className="text-left py-1 pr-4">Type</th>
                    <th className="text-left py-1">Price/night</th>
                    <th className="text-left py-1">Total</th>
                  </tr></thead>
                  <tbody>
                    {group.rooms.map(r => (
                      <tr key={r.id} className="border-b border-stone-900 text-green-300">
                        <td className="py-1 pr-4">{r.roomNumber}</td>
                        <td className="py-1 pr-4">{r.roomType}</td>
                        <td className="py-1 pr-4">₹{r.pricePerNight.toLocaleString('en-IN')}</td>
                        <td className="py-1">₹{r.totalPrice.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
          <details className="mt-3">
            <summary className="text-stone-600 cursor-pointer text-xs">Raw JSON</summary>
            <pre className="bg-stone-950 p-3 rounded mt-2 text-xs text-stone-400 overflow-auto max-h-48">{JSON.stringify(availability, null, 2)}</pre>
          </details>
        </section>
      )}

      {/* ── ALL BOOKINGS TABLE ────────────────────────────────────────────── */}
      {(bookings.length > 0 || bookingsError) && (
        <section className="bg-stone-900 border border-stone-800 rounded-xl p-5 mb-6">
          <h2 className="text-amber-300 font-semibold mb-3">3. All Bookings ({bookings.length})</h2>
          {bookingsError && <p className="text-red-400 mb-3">❌ {bookingsError}</p>}
          {bookings.length > 0 && (
            <div className="overflow-auto">
              <table className="w-full border-collapse text-xs">
                <thead><tr className="text-stone-600 border-b border-stone-800">
                  <th className="text-left py-1 pr-4">ID</th>
                  <th className="text-left py-1 pr-4">Status</th>
                  <th className="text-left py-1 pr-4">Check-in</th>
                  <th className="text-left py-1 pr-4">Check-out</th>
                  <th className="text-left py-1 pr-4">Rooms</th>
                  <th className="text-left py-1">Created</th>
                </tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} className="border-b border-stone-900">
                      <td className="py-1 pr-4 text-amber-400">#{b.id}</td>
                      <td className="py-1 pr-4">
                        <span className={`px-2 py-0.5 rounded text-xs ${statusColor(b.bookingStatus)}`}>{b.bookingStatus}</span>
                      </td>
                      <td className="py-1 pr-4 text-stone-300">{isoDate(b.checkIn)}</td>
                      <td className="py-1 pr-4 text-stone-300">{isoDate(b.checkOut)}</td>
                      <td className="py-1 pr-4 text-stone-300">{b.rooms?.map(r => r.roomNumber).join(', ') || '—'}</td>
                      <td className="py-1 text-stone-500">{fmtDate(b.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ── OVERLAP DEBUG ─────────────────────────────────────────────────── */}
      {overlapDebug.length > 0 && (
        <section className="bg-stone-900 border border-stone-800 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <h2 className="text-amber-300 font-semibold">4. Visual Overlap Debug
              <span className="text-stone-500 text-xs ml-2">(search: {checkIn} → {checkOut})</span>
            </h2>
            <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer">
              <input type="checkbox" checked={ignorePending} onChange={e => recompute(e.target.checked)}
                className="accent-amber-400" />
              Ignore PENDING bookings
            </label>
          </div>

          <div className="space-y-4">
            {overlapDebug.map(item => (
              <div key={item.room} className={`rounded-lg border p-4 ${item.available ? 'border-green-800 bg-green-950/30' : 'border-red-800 bg-red-950/30'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base font-bold text-stone-100">Room {item.room}</span>
                  {item.available
                    ? <span className="text-green-400 font-semibold text-sm">✅ Available</span>
                    : <span className="text-red-400 font-semibold text-sm">🚫 Blocked</span>}
                </div>

                {!item.available && item.blockedBy.map(block => (
                  <div key={block.bookingId} className="bg-stone-950/70 rounded p-3 mb-2 text-xs space-y-1 border border-red-900/50">
                    <p className="text-red-300 font-semibold">Blocked by Booking #{block.bookingId}
                      <span className={`ml-2 px-1.5 py-0.5 rounded ${statusColor(block.status)}`}>{block.status}</span>
                    </p>
                    <p className="text-stone-400">Existing: <span className="text-stone-200">{isoDate(block.checkIn)}</span> → <span className="text-stone-200">{isoDate(block.checkOut)}</span></p>
                    <p className="text-stone-400">Search:   <span className="text-stone-200">{checkIn}</span> → <span className="text-stone-200">{checkOut}</span></p>
                    <div className="mt-2 space-y-0.5 font-mono">
                      <p>
                        <span className="text-stone-500">existing.checkIn ({isoDate(block.checkIn)}) &lt; search.checkOut ({checkOut}):</span>{' '}
                        <span className={block.c1 ? 'text-green-400' : 'text-red-400'}>{block.c1 ? 'TRUE' : 'FALSE'}</span>
                      </p>
                      <p>
                        <span className="text-stone-500">existing.checkOut ({isoDate(block.checkOut)}) &gt; search.checkIn ({checkIn}):</span>{' '}
                        <span className={block.c2 ? 'text-green-400' : 'text-red-400'}>{block.c2 ? 'TRUE' : 'FALSE'}</span>
                      </p>
                      {block.c1 && block.c2 &&
                        <p className="text-red-400 font-bold">⚠ Both TRUE → OVERLAPS → blocks room</p>}
                      {!(block.c1 && block.c2) &&
                        <p className="text-green-400">✓ No overlap (should not block)</p>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── QUICK FIX BUTTONS ─────────────────────────────────────────────── */}
      <section className="bg-stone-900 border border-stone-800 rounded-xl p-5">
        <h2 className="text-amber-300 font-semibold mb-3">5. Quick Fix Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={cancelAllPending} disabled={loadingCancel}
            className="bg-red-800 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded text-sm disabled:opacity-50">
            {loadingCancel ? 'Cancelling…' : '🗑 Cancel All Pending Bookings'}
          </button>
          <button onClick={() => { setAvailability(null); setBookings([]); setOverlapDebug([]); setCancelMsg(null) }}
            className="bg-stone-700 hover:bg-stone-600 text-white font-semibold px-4 py-2 rounded text-sm">
            🔄 Reset State
          </button>
        </div>
        {cancelMsg && (
          <p className={`mt-3 text-sm ${cancelMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {cancelMsg}
          </p>
        )}
      </section>
    </div>
  )
}
