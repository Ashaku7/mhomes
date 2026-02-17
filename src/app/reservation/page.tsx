'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Users, Mail, Phone, Check, Wifi, ShoppingCart, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import emailjs from '@emailjs/browser'

// Initialize EmailJS
if (typeof window !== 'undefined') {
  emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!)
}

interface ReservationData {
  checkIn: string
  checkOut: string
  guests: number
  selectedRooms: Array<{ type: 'deluxe' | 'premium'; count: number }>
  firstName: string
  lastName: string
  email: string
  phone: string
  specialRequests: string
}

const ROOM_CONFIGS = {
  deluxe: {
    name: 'Deluxe Twin Room',
    maxOccupancy: 3,
    price: 650,
    description: 'Luxury suite with panoramic views',
    amenities: [
      'Traditional Palace Welcome',
      'Breakfast Included for Guests',
      'Free Wi-Fi',
      'Palace Hi-Tea with Rajasthani Folk performance',
      'Luxury Bedding',
      'Premium Toiletries'
    ]
  },
  premium: {
    name: 'Premium Room',
    maxOccupancy: 2,
    price: 450,
    description: 'Spacious room with private balcony',
    amenities: [
      'Oceanfront Views',
      'Breakfast Included',
      'High-Speed WiFi',
      'Private Balcony',
      'Mini Bar',
      'Work Desk'
    ]
  }
}

export default function ReservationPage() {
  const [reservationData, setReservationData] = useState<ReservationData>({
    checkIn: '',
    checkOut: '',
    guests: 2,
    selectedRooms: [],
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [numberOfNights, setNumberOfNights] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Load data from URL query parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const checkInParam = params.get('checkIn')
      const checkOutParam = params.get('checkOut')
      const guestsParam = params.get('guests')
      const stepParam = params.get('step')

      if (checkInParam && checkOutParam && guestsParam) {
        setReservationData(prev => ({
          ...prev,
          checkIn: checkInParam,
          checkOut: checkOutParam,
          guests: parseInt(guestsParam)
        }))
      }

      if (stepParam === '2') {
        setCurrentStep(2)
      }
    }
  }, [])

  // Calculate number of nights
  useEffect(() => {
    if (reservationData.checkIn && reservationData.checkOut) {
      const checkIn = new Date(reservationData.checkIn)
      const checkOut = new Date(reservationData.checkOut)
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      setNumberOfNights(nights > 0 ? nights : 0)
    }
  }, [reservationData.checkIn, reservationData.checkOut])

  // Calculate required rooms based on guests
  const calculateRequiredRooms = (guestCount: number) => {
    const deluxeRooms = Math.ceil(guestCount / ROOM_CONFIGS.deluxe.maxOccupancy)
    const premiumRooms = Math.ceil(guestCount / ROOM_CONFIGS.premium.maxOccupancy)
    return { deluxe: deluxeRooms, premium: premiumRooms }
  }

  const requiredRooms = calculateRequiredRooms(reservationData.guests)

  // Calculate total price
  const totalPrice = numberOfNights * (
    reservationData.selectedRooms.reduce((sum, room) => 
      sum + (room.count * (ROOM_CONFIGS[room.type].price)), 0
    )
  )
  const discount = totalPrice * 0.15
  const finalPrice = totalPrice - discount

  const handleInputChange = (field: keyof ReservationData, value: any) => {
    setReservationData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleRoomSelection = (roomType: 'deluxe' | 'premium') => {
    setReservationData(prev => ({
      ...prev,
      selectedRooms: [{ type: roomType, count: requiredRooms[roomType] }]
    }))
    setCurrentStep(3)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const roomType = reservationData.selectedRooms.length > 0 
        ? ROOM_CONFIGS[reservationData.selectedRooms[0].type].name 
        : 'Standard Room'

      // Send admin notification email only
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID!,
        {
          first_name: reservationData.firstName,
          last_name: reservationData.lastName,
          email: reservationData.email,
          phone: reservationData.phone,
          check_in: new Date(reservationData.checkIn).toLocaleDateString(),
          check_out: new Date(reservationData.checkOut).toLocaleDateString(),
          guests: reservationData.guests.toString(),
          room_type: roomType,
          special_requests: reservationData.specialRequests || 'None'
        }
      )

      // Also save to localStorage as backup
      const reservations = JSON.parse(localStorage.getItem('mhomesReservations') || '[]')
      reservations.push({
        ...reservationData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      })
      localStorage.setItem('mhomesReservations', JSON.stringify(reservations))

      setIsSubmitting(false)
      setShowSuccess(true)

      setTimeout(() => {
        setReservationData({
          checkIn: '',
          checkOut: '',
          guests: 2,
          selectedRooms: [],
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          specialRequests: ''
        })
        setCurrentStep(1)
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Failed to send email:', error)
      setIsSubmitting(false)
      setSubmitError('Failed to submit reservation. Please try again or contact support.')
    }
  }

  const isStep1Complete = reservationData.checkIn && reservationData.checkOut && numberOfNights > 0
  const isStep2Complete = reservationData.selectedRooms.length > 0
  const isStep3Complete = reservationData.firstName && reservationData.lastName && reservationData.email && reservationData.phone

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header with Logo */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-accent/20 shadow-sm"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/mhomes-logo.png"
                alt="MHomes Resort"
                width={50}
                height={50}
                className="object-contain drop-shadow-lg group-hover:drop-shadow-xl transition-all"
              />
            </motion.div>
            <div className="hidden sm:flex flex-col">
              <span className="luxury-heading text-lg font-bold text-primary">mhomes</span>
              <span className="luxury-text text-xs text-muted-foreground">An Immortal Paradise</span>
            </div>
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative pt-32 pb-16 px-4 overflow-hidden">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(59, 130, 246, 0.08) 50%, rgba(251, 146, 60, 0.08) 100%)',
            backgroundSize: '400% 400%'
          }}
        />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ y: [0, -40, 0], x: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />

        <div className="relative z-10 container mx-auto max-w-6xl">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div className="inline-block mb-4">
              <Badge className="bg-accent/20 text-accent border border-accent/50 px-4 py-2 rounded-full">
                 Complete Your Booking
              </Badge>
            </motion.div>
            <h1 className="luxury-heading text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary mb-6">
              Reserve Your Paradise
            </h1>
            <p className="luxury-text text-xl text-muted-foreground max-w-3xl mx-auto">
              Secure your dates and experience the ultimate luxury at MHomes Resort
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto max-w-6xl px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="luxury-card bg-gradient-to-br from-white/50 to-white/30 border border-accent/20 rounded-3xl p-12 text-center backdrop-blur-sm"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-400 to-accent rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check size={40} className="text-white" />
                </motion.div>
                <h2 className="luxury-heading text-4xl font-bold text-primary mb-4">Reservation Confirmed!</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  A confirmation email has been sent to <span className="font-semibold text-primary">{reservationData.email}</span>
                </p>
                <p className="text-muted-foreground mb-8">
                  Our team will contact you shortly to finalize your booking details.
                </p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white px-8 py-3">
                    Back to Home
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: Dates & Guests */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="luxury-card bg-gradient-to-br from-white/50 to-white/30 border border-accent/20 rounded-3xl p-8 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-accent/20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <h2 className="luxury-heading text-2xl font-bold text-primary">Search</h2>
                    <span className="text-muted-foreground ml-auto text-sm">
                      {reservationData.checkIn && reservationData.checkOut && numberOfNights > 0 ? (
                        `${new Date(reservationData.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })} - ${new Date(reservationData.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })} / ${reservationData.guests} Guest${reservationData.guests > 1 ? 's' : ''}`
                      ) : (
                        'Select dates and guests'
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Check-in */}
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-3">Check-in Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-4 text-accent" size={20} />
                        <input
                          type="date"
                          value={reservationData.checkIn}
                          onChange={(e) => handleInputChange('checkIn', e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-3 bg-white/50 border border-accent/30 text-primary rounded-xl focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                        />
                      </div>
                    </div>

                    {/* Check-out */}
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-3">Check-out Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-4 text-accent" size={20} />
                        <input
                          type="date"
                          value={reservationData.checkOut}
                          onChange={(e) => handleInputChange('checkOut', e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-3 bg-white/50 border border-accent/30 text-primary rounded-xl focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-3">Number of Guests</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-4 text-accent" size={20} />
                      <select
                        value={reservationData.guests}
                        onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                        className="w-full pl-12 pr-4 py-3 bg-white/50 border border-accent/30 text-primary rounded-xl focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                      >
                        {[1, 2, 3, 4, 5, 6].map(n => (
                          <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>

                {/* Step 2: Select Room */}
                {isStep1Complete && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <h2 className="luxury-heading text-2xl font-bold text-primary">Select Room ({reservationData.guests} Guest{reservationData.guests > 1 ? 's' : ''})</h2>
                    </div>

                    {/* Room Cards */}
                    <div className="grid grid-cols-1 gap-6">
                      {/* Premium Room */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        className="luxury-card bg-gradient-to-br from-white/50 to-white/30 border border-accent/20 hover:border-accent/50 roun/premium.jpgr-sm transition-all"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Image */}
                          <div className="relative h-40 md:h-auto rounded-xl overflow-hidden">
                            <Image
                              src="/premium.jpg"
                              alt="Premium Room"
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Details */}
                          <div className="md:col-span-1">
                            <h3 className="luxury-heading text-xl font-bold text-primary mb-2">
                              {ROOM_CONFIGS.premium.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <Users size={18} className="text-accent" />
                              <span className="text-muted-foreground">Up to {ROOM_CONFIGS.premium.maxOccupancy} guests</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              {ROOM_CONFIGS.premium.description}
                            </p>
                            <div className="space-y-2">
                              {ROOM_CONFIGS.premium.amenities.slice(0, 3).map((amenity, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <Check size={16} className="text-accent flex-shrink-0 mt-0.5" />
                                  {amenity}
                                </div>
                              ))}
                              <button className="text-accent font-semibold text-sm hover:text-primary transition">
                                +{ROOM_CONFIGS.premium.amenities.length - 3} more
                              </button>
                            </div>
                          </div>

                          {/* Pricing & Action */}
                          <div className="flex flex-col justify-between">
                            <div>
                              <p className="text-muted-foreground text-sm mb-2">
                                ?{ROOM_CONFIGS.premium.price.toLocaleString()} INR / Night
                              </p>
                              <div className="text-lg font-semibold text-muted-foreground">
                                Plus ?{(ROOM_CONFIGS.premium.price * 0.2).toLocaleString()} In Taxes & Fees/Night
                              </div>
                              <div className="mt-4 pt-4 border-t border-accent/20">
                                <p className="text-muted-foreground text-xs mb-1">
                                  Total ?{(requiredRooms.premium * ROOM_CONFIGS.premium.price * numberOfNights).toLocaleString()} for {numberOfNights} Night{numberOfNights > 1 ? 's' : ''} Includes Taxes & Fees
                                </p>
                                <p className="text-sm font-semibold text-primary">
                                  {requiredRooms.premium} Room{requiredRooms.premium > 1 ? 's' : ''} needed
                                </p>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => handleRoomSelection('premium')}
                              className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all mt-6"
                            >
                              Reserve Now
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>

                      {/* Deluxe Room */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ y: -4 }}
                        className="luxury-card bg-gradient-to-br fr/deluxe.jpgborder border-accent/20 hover:border-accent/50 rounded-2xl p-6 backdrop-blur-sm transition-all"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Image */}
                          <div className="relative h-40 md:h-auto rounded-xl overflow-hidden">
                            <Image
                              src="/deluxe.jpg"
                              alt="Deluxe Room"
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Details */}
                          <div className="md:col-span-1">
                            <h3 className="luxury-heading text-xl font-bold text-primary mb-2">
                              {ROOM_CONFIGS.deluxe.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <Users size={18} className="text-accent" />
                              <span className="text-muted-foreground">Up to {ROOM_CONFIGS.deluxe.maxOccupancy} guests</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              {ROOM_CONFIGS.deluxe.description}
                            </p>
                            <div className="space-y-2">
                              {ROOM_CONFIGS.deluxe.amenities.slice(0, 3).map((amenity, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <Check size={16} className="text-accent flex-shrink-0 mt-0.5" />
                                  {amenity}
                                </div>
                              ))}
                              <button className="text-accent font-semibold text-sm hover:text-primary transition">
                                +{ROOM_CONFIGS.deluxe.amenities.length - 3} more
                              </button>
                            </div>
                          </div>

                          {/* Pricing & Action */}
                          <div className="flex flex-col justify-between">
                            <div>
                              <p className="text-muted-foreground text-sm mb-2">
                                ?{ROOM_CONFIGS.deluxe.price.toLocaleString()} INR / Night
                              </p>
                              <div className="text-lg font-semibold text-muted-foreground">
                                Plus ?{(ROOM_CONFIGS.deluxe.price * 0.2).toLocaleString()} In Taxes & Fees/Night
                              </div>
                              <div className="mt-4 pt-4 border-t border-accent/20">
                                <p className="text-muted-foreground text-xs mb-1">
                                  Total ?{(requiredRooms.deluxe * ROOM_CONFIGS.deluxe.price * numberOfNights).toLocaleString()} for {numberOfNights} Night{numberOfNights > 1 ? 's' : ''} Includes Taxes & Fees
                                </p>
                                <p className="text-sm font-semibold text-primary">
                                  {requiredRooms.deluxe} Room{requiredRooms.deluxe > 1 ? 's' : ''} needed
                                </p>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => handleRoomSelection('deluxe')}
                              className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all mt-6"
                            >
                              Reserve Now
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Guest Information */}
                {isStep2Complete && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="luxury-card bg-gradient-to-br from-white/50 to-white/30 border border-accent/20 rounded-3xl p-8 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-accent/20">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <h2 className="luxury-heading text-2xl font-bold text-primary">Guest Information</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div>
                          <label className="block text-sm font-semibold text-primary mb-3">First Name</label>
                          <Input
                            type="text"
                            value={reservationData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="John"
                            required
                            className="bg-white/50 border-accent/30 text-primary placeholder:text-muted-foreground focus:border-accent rounded-xl"
                          />
                        </div>

                        {/* Last Name */}
                        <div>
                          <label className="block text-sm font-semibold text-primary mb-3">Last Name</label>
                          <Input
                            type="text"
                            value={reservationData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Doe"
                            required
                            className="bg-white/50 border-accent/30 text-primary placeholder:text-muted-foreground focus:border-accent rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div>
                          <label className="block text-sm font-semibold text-primary mb-3">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-4 text-accent" size={20} />
                            <Input
                              type="email"
                              value={reservationData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="john@example.com"
                              required
                              className="pl-12 bg-white/50 border-accent/30 text-primary placeholder:text-muted-foreground focus:border-accent rounded-xl"
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-semibold text-primary mb-3">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-4 text-accent" size={20} />
                            <Input
                              type="tel"
                              value={reservationData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="+91 XXXXX XXXXX"
                              required
                              className="pl-12 bg-white/50 border-accent/30 text-primary placeholder:text-muted-foreground focus:border-accent rounded-xl"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Special Requests */}
                      <div>
                        <label className="block text-sm font-semibold text-primary mb-3">Special Requests (Optional)</label>
                        <Textarea
                          value={reservationData.specialRequests}
                          onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                          placeholder="Any special requests? Late checkout, high floor preference, etc."
                          className="bg-white/50 border-accent/30 text-primary placeholder:text-muted-foreground focus:border-accent rounded-xl min-h-24"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                {isStep2Complete && isStep3Complete && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-red-700 font-medium">{submitError}</p>
                      </motion.div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 text-lg"
                    >
                      {isSubmitting ? 'Processing Reservation...' : 'Complete Reservation'}
                    </motion.button>
                  </motion.div>
                )}
              </form>
            )}
          </motion.div>

          {/* Sidebar - Summary */}
          {isStep1Complete && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-32 luxury-card bg-gradient-to-br from-white/50 to-white/30 border border-accent/20 rounded-3xl p-8 backdrop-blur-sm space-y-6">
                <h3 className="luxury-heading text-2xl font-bold text-primary mb-6">Booking Summary</h3>

                {/* Room Details */}
                <div className="space-y-3 pb-6 border-b border-accent/20">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in:</span>
                    <span className="font-semibold text-primary">
                      {new Date(reservationData.checkIn).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out:</span>
                    <span className="font-semibold text-primary">
                      {new Date(reservationData.checkOut).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nights:</span>
                    <span className="font-semibold text-primary">{numberOfNights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests:</span>
                    <span className="font-semibold text-primary">{reservationData.guests}</span>
                  </div>
                </div>

                {/* Selected Rooms */}
                {isStep2Complete && (
                  <div className="pb-6 border-b border-accent/20">
                    <p className="text-muted-foreground mb-3 text-sm font-semibold">ROOMS SELECTED</p>
                    {reservationData.selectedRooms.map(room => (
                      <div key={room.type} className="mb-2">
                        <p className="font-semibold text-primary">{ROOM_CONFIGS[room.type].name}</p>
                        <p className="text-sm text-muted-foreground">
                          {room.count} Room{room.count > 1 ? 's' : ''}  ?{ROOM_CONFIGS[room.type].price.toLocaleString()}/night
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Price Breakdown */}
                {isStep2Complete && (
                  <div className="space-y-3 pb-6 border-b border-accent/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold text-primary">?{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>15% Early Booking Discount</span>
                      <span className="font-semibold">-?{discount.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Total */}
                {isStep2Complete && (
                  <motion.div
                    className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl p-4 border border-accent/30"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="luxury-heading font-bold text-primary">Total Amount</span>
                      <span className="luxury-heading text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                        ?{finalPrice.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Info */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">
                    ℹ️ Secure your reservation with this price. Payment details will be provided in your confirmation email.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
