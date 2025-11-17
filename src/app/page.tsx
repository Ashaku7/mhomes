'use client'

import { useState, useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Menu, 
  X, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Wifi, 
  Car, 
  MessageCircle,
  ChevronDown,
  Users,
  ArrowRight,
  Quote,
  Award,
  Shield,
  Bath
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

export default function MHomesResort() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [selectedAmenitiesRoom, setSelectedAmenitiesRoom] = useState<string | null>(null)
  const [carouselIndices, setCarouselIndices] = useState<{ [key: string]: number }>({})

  // Hero booking form state
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)
  const [guests, setGuests] = useState<number>(2)

  const handleHeroSearch = () => {
    if (!checkIn || !checkOut) {
      // lightweight UX feedback for now
      if (typeof window !== 'undefined') window.alert('Please select check-in and check-out dates')
      return
    }
    const el = document.getElementById('accommodations')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setActiveSection('accommodations')
    console.log('Hero search', { checkIn, checkOut, guests })
  }

  // Ensure hero video plays (autoplay policies may block play promise)
  const heroVideoRef = useRef<HTMLVideoElement | null>(null)
  const [heroAutoplayFailed, setHeroAutoplayFailed] = useState(false)
  const [heroIsPlaying, setHeroIsPlaying] = useState(false)
  const [heroError, setHeroError] = useState<string | null>(null)
  const [heroCanPlay, setHeroCanPlay] = useState(false)

  useEffect(() => {
    const v = heroVideoRef.current
    if (!v) return

    // Ensure muted (helps autoplay), then try to play and handle rejected promise
    v.muted = true
    const p = v.play()
    if (p && typeof p.then === 'function') {
      p.then(() => {
        setHeroIsPlaying(true)
        // playing
      }).catch((err) => {
        // If autoplay is blocked, keep it muted and show a visual cue (could show play button)
        console.warn('Hero video autoplay was prevented:', err)
        setHeroAutoplayFailed(true)
        // attempt a second time after a short delay
        setTimeout(() => {
          try {
            v.muted = true
            v.play().catch(() => {})
          } catch (e) {}
        }, 500)
      })
    }
  }, [])

  const getCarouselIndex = (roomName: string) => carouselIndices[roomName] || 0
  
  const nextImage = (roomName: string, totalImages: number) => {
    setCarouselIndices(prev => ({
      ...prev,
      [roomName]: ((prev[roomName] || 0) + 1) % totalImages
    }))
  }
  
  const prevImage = (roomName: string, totalImages: number) => {
    setCarouselIndices(prev => ({
      ...prev,
      [roomName]: ((prev[roomName] || 0) - 1 + totalImages) % totalImages
    }))
  }
  const [activeSection, setActiveSection] = useState('home')
  const [shouldAnimateHome, setShouldAnimateHome] = useState(false)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  const resortImages = {
    hero: "https://images.unsplash.com/photo-1589779677460-a15b5b5790ce?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXNvcnR8ZW58MHx8fGJsdWV8MTc1NjU2NjU1NXww&ixlib=rb-4.1.0&q=85",
    villa: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjByZXNvcnR8ZW58MHx8fGJsdWV8MTc1NjU2NjU1NXww&ixlib=rb-4.1.0&q=85",
    pool: "https://images.unsplash.com/photo-1540541338287-41700207dee6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjByZXNvcnR8ZW58MHx8fGJsdWV8MTc1NjU2NjU1NXww&ixlib=rb-4.1.0&q=85",
    beach: "https://images.unsplash.com/photo-1589488276470-afc70b3c655f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMGhvdGVsfGVufDB8fHxibHVlfDE3NTY1NjY1NjJ8MA&ixlib=rb-4.1.0&q=85",
    pier: "https://images.unsplash.com/photo-1551598305-fe1be9fe579e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwzfHxvY2VhbiUyMGhvdGVsfGVufDB8fHxibHVlfDE3NTY1NjY1NjJ8MA&ixlib=rb-4.1.0&q=85",
    sunset: "https://images.unsplash.com/photo-1560996379-2a37cf3e7152?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHw0fHxvY2VhbiUyMGhvdGVsfGVufDB8fHxibHVlfDE3NTY1NjY1NjJ8MA&ixlib=rb-4.1.0&q=85"
  }

  const navigationItems = [
    { name: 'Home', href: '#home', icon: '🏠' },
    { name: 'Story', href: '#story', icon: '📖' },
    { name: 'Accommodations', href: '#accommodations', icon: '🏨' },
    { name: 'Gallery', href: '#gallery', icon: '📸' },
    { name: 'Reviews', href: '#reviews', icon: '⭐' },
    { name: 'Booking', href: '#booking', icon: '📅' },
    { name: 'Contact', href: '#contact', icon: '📞' }
  ]

  const accommodationTypes = [
    {
      name: 'Premium Room',
      description: 'Sophisticated rooms with modern amenities and garden or pool views',
      image: resortImages.pool,
      images: [resortImages.pool, resortImages.villa, resortImages.sunset],
      price: '$450',
      bedType: 'Queen Bed',
      sqft: '45 sqm',
      maxGuests: '2',
      features: ['Pool View', 'Queen Bed', '45 sqm', 'Mini Bar']
    },
    {
      name: 'Deluxe Studio',
      description: 'Comfortable studios perfect for couples seeking luxury and convenience',
      image: resortImages.pier,
      images: [resortImages.pier, resortImages.beach, resortImages.pool],
      price: '$320',
      bedType: 'Double Bed',
      sqft: '35 sqm',
      maxGuests: '2',
      features: ['Garden View', 'Double Bed', '35 sqm', 'Work Desk']
    }
  ]

  const roomAmenities = {
    'Premium Room': ['42-inch Smart TV', 'Premium Bedding', 'Rainfall Shower', 'Air Conditioning', 'Mini Bar', 'Work Desk', 'High-Speed WiFi', 'Flat-screen TV', 'Bath Robes', 'Premium Toiletries', 'Nespresso Machine', 'Safe Deposit Box', 'Turn-down Service', 'Daily Housekeeping'],
    'Deluxe Studio': ['32-inch Smart TV', 'Luxury Bedding', 'Modern Bathroom', 'Climate Control', 'Kitchenette', 'Dining Area', 'High-Speed WiFi', 'Seating Area', 'Premium Toiletries', 'Walk-in Shower', 'Free Coffee Maker', 'Digital Lock', 'Express Check-in', 'Daily Cleaning']
  }

  const testimonials = [
    {
      name: 'Sarah Johnson',
      location: 'New York, USA',
      rating: 5,
      text: 'Absolutely magical experience! The overwater villa was beyond our dreams, and the service was impeccable. Can\'t wait to return!',
      image: '/api/placeholder/60/60'
    },
    {
      name: 'Marco Rodriguez',
      location: 'Madrid, Spain',
      rating: 5,
      text: 'The perfect honeymoon destination. Every detail was carefully planned, from the private beach dinner to the couples spa treatments.',
      image: '/api/placeholder/60/60'
    },
    {
      name: 'Emily Chen',
      location: 'Singapore',
      rating: 5,
      text: 'Luxury redefined. The attention to detail and personalized service made our anniversary celebration truly unforgettable.',
      image: '/api/placeholder/60/60'
    }
  ]

  const amenities = [
    { icon: Wifi, name: 'High-Speed WiFi', description: 'Complimentary throughout resort' },
    { icon: Car, name: 'Valet Parking', description: 'Secure parking with valet service' },
    { icon: Users, name: 'Pickleball', description: 'Outdoor court available for engaging physical activities' },
    { icon: Bath, name: 'Swimming Pool', description: 'A calm, cozy pool perfect for a refreshing dip.' },
    { icon: MapPin, name: 'Meenakshi Amman Koil (Temple)', description: 'Nearby cultural landmark and local temples' }
  ]

  const storyData = [
    {
      word: 'Madurai',
      description: 'The ancient City of Temples, where thousands of years of history echo through sacred streets. Madurai inspires us to build a resort that honors tradition while embracing modern luxury. Every corner reflects the vibrant culture and warm hospitality that defines this legendary city.',
      image: '/Madurai.png'
    },
    {
      word: 'Meenakshi',
      description: 'Goddess of divine beauty and strength, Meenakshi Amman embodies grace, power, and eternal elegance. Her legendary temple stands as a testament to architectural brilliance and spiritual majesty. We draw inspiration from her legend to create unforgettable moments of transcendence and wonder for our guests.',
      image: '/Meenakshi.png'
    },
    {
      word: 'Meen',
      description: 'The fish, symbol of life, movement, and the boundless ocean that surrounds our paradise resort. Meen represents freedom, harmony with nature, and the gentle flow of luxury that permeates every experience. Our waters teem with life, just as our resort teems with unforgettable adventures.',
      image: '/fish.png'
    },
    {
      word: 'Meena',
      description: 'Our visionary founder whose passion and dreams transformed an island into a sanctuary of luxury and wonder. Meena\'s dedication to excellence and unwavering commitment to guest happiness is woven into the very fabric of MHomes Resort. Her legacy is every smile, every memory, and every magical moment our guests experience.',
      image: '/logo.png'
    }
  ]


  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'story', 'accommodations', 'gallery', 'reviews', 'booking', 'contact']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isChatOpen && chatInputRef.current) {
      // Focus input when chat opens
      setTimeout(() => {
        if (chatInputRef.current) {
          chatInputRef.current.focus()
        }
      }, 100)
    }
  }, [isChatOpen])

  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: 'Hello! Welcome to MHomes Resort. I\'m your virtual assistant. How can I help you plan your perfect vacation?', sender: 'bot', timestamp: new Date() }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatInputRef = useRef<HTMLInputElement | null>(null)

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = { id: Date.now(), text: chatInput, sender: 'user', timestamp: new Date() }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput })
      })
      const data = await response.json()
      const botMessage = { id: Date.now() + 1, text: data.response, sender: 'bot', timestamp: new Date() }
      setChatMessages(prev => [...prev, botMessage])
      // Keep focus on input after response
      if (chatInputRef.current) {
        chatInputRef.current.focus()
      }
    } catch (error) {
      const errorMessage = { id: Date.now() + 1, text: 'Sorry, I\'m having trouble connecting. Please try again later.', sender: 'bot', timestamp: new Date() }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleChatKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendChatMessage()
    }
  }

  const handleNavigationClick = (href: string) => {
    if (href === '#home' && activeSection !== 'home') {
      setShouldAnimateHome(true)
      // Reset animation after a short delay
      setTimeout(() => setShouldAnimateHome(false), 100)
    }
    setIsMenuOpen(false)
  }

  const ChatWidget = () => (
    <div className="chatbot-float">
      <Button
        type="button"
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="w-16 h-16 rounded-full bg-accent hover:bg-accent/90 text-white shadow-2xl"
      >
        <MessageCircle className="w-8 h-8" />
      </Button>

      {isChatOpen && (
        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute bottom-20 right-0 w-80 h-96 bg-card glass-effect rounded-xl shadow-2xl flex flex-col chatbot-border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="luxury-heading text-sm">Resort Assistant</h3>
                  <p className="luxury-text text-xs text-muted-foreground">Online</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="luxury-text text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                ref={chatInputRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyPress}
                autoFocus={isChatOpen}
                onBlur={() => {
                  // Keep focus in the input while the chat is open
                  if (isChatOpen) {
                    setTimeout(() => chatInputRef.current?.focus(), 0)
                  }
                }}
                placeholder="Ask me anything about the resort..."
                className="flex-1"
                disabled={isChatLoading}
              />
              <Button
                onClick={sendChatMessage}
                disabled={!chatInput.trim() || isChatLoading}
                size="sm"
                type="button"
              >
                <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="#home" className="flex items-center space-x-3 group">
              <motion.div 
                className="flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110 -my-2"
                animate={shouldAnimateHome ? { rotate: [0, 360] } : {}}
                transition={shouldAnimateHome ? { duration: 0.6, ease: "easeInOut" } : {}}
              >
                <Image
                  src="/mhomes-logo.png"
                  alt="MHomes Resort Logo"
                  width={180}
                  height={180}
                  priority
                  style={{ width: 'auto' }}
                  className="object-contain drop-shadow-lg"
                />
              </motion.div>
            </Link>

            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => handleNavigationClick(item.href)}
                  className={`luxury-text transition-colors duration-200 hover:text-accent ${
                    activeSection === item.name.toLowerCase() ? 'text-accent font-semibold' : 'text-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden glass-effect border-t"
          >
            <div className="container mx-auto px-4 py-3 space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => handleNavigationClick(item.href)}
                  className="block luxury-text hover:text-accent transition-colors"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section with video background, persistent logo/title and booking form */}
      <section id="home" className="relative h-screen overflow-hidden">
        {/* Video Background (placeholder) */}

        <div className="absolute inset-0 z-0">
          <video
            ref={heroVideoRef}
            className="w-full h-full object-fill object-center"
            autoPlay
            loop
            playsInline
            preload="auto"
            poster={resortImages.hero}
            controls
            controlsList="nodownload"
            style={{ pointerEvents: 'auto' }}
            onCanPlay={() => {
              console.log('Hero video can play')
              setHeroCanPlay(true)
              const v = heroVideoRef.current
              if (v && v.paused) {
                v.play().then(() => setHeroIsPlaying(true)).catch((e) => console.warn('play after canplay failed', e))
              }
            }}
            onError={(e) => {
              console.error('Hero video error', e)
              setHeroError('Video failed to load/encode. Falling back to remote source.')
              setHeroAutoplayFailed(true)
            }}
            onPlaying={() => {
              setHeroIsPlaying(true)
              setHeroAutoplayFailed(false)
              setHeroError(null)
            }}
          >
            {/* Local public video - served from /resort.mp4 */}
            <source src="/resort.mp4" type="video/mp4" />
            {/* Remote fallback */}
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60 pointer-events-none" />
        </div>

          {/* Play overlay (visible when autoplay fails or video is paused) */}
          {heroAutoplayFailed && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-auto">
              <button
                onClick={async () => {
                  const v = heroVideoRef.current
                  if (!v) return
                  try {
                    v.muted = true
                    await v.play()
                    setHeroAutoplayFailed(false)
                    setHeroIsPlaying(true)
                  } catch (err) {
                    console.warn('Manual play failed', err)
                    setHeroError(String(err || 'play failed'))
                  }
                }}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full p-4 backdrop-blur-md shadow-lg"
                aria-label="Play background video"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
                  <path d="M5 3v18l15-9L5 3z" />
                </svg>
              </button>
            </div>
          )}

          {/* If there is a video error, show a small hint with retry */}
          {heroError && (
            <div className="absolute bottom-6 right-6 z-30">
              <div className="bg-white/10 glass-effect text-white px-4 py-2 rounded-lg">
                <div className="text-sm">{heroError}</div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => {
                    setHeroError(null)
                    setHeroAutoplayFailed(false)
                    const v = heroVideoRef.current
                    if (v) { v.load(); v.muted = true; v.play().catch(()=>{}) }
                  }}>Retry</Button>
                </div>
              </div>
            </div>
          )}
        

        {/* Persistent header overlay inside hero (logo + name) */}
        <div className="absolute top-6 left-0 right-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-4 bg-white/10 glass-effect rounded-full px-4 py-2 backdrop-blur-sm pointer-events-auto">
            <Image src="/mhomes-logo.png" alt="MHomes" width={64} height={64} style={{ width: 'auto' }} className="object-contain" />
            <div className="text-white text-center">
              <div className="luxury-heading text-2xl md:text-3xl mhomes-brown">mhomes</div>
              <div className="luxury-text text-sm text-white/90 -mt-1">An Immortal Paradise by the Sea</div>
            </div>
          </div>
        </div>

        {/* Main hero content (centered) */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto"
          >
            <motion.h1
              className="luxury-heading text-6xl md:text-8xl lg:text-[7rem] mb-4 tracking-wider font-light hero-text-shadow mhomes-brown"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              mhomes
            </motion.h1>

            <motion.p className="luxury-text text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed hero-text-shadow mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              Experience luxury redefined at MHomes Resort, where every moment becomes a treasured memory in our tropical paradise
            </motion.p>

            {/* Booking form overlay */}
            <div className="mt-6">
              <div className="glass-effect rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 shadow-xl backdrop-blur-md">
                {/* Check-in */}
                <div className="flex flex-col">
                  <label className="luxury-text text-xs text-white/80 mb-1">Check-in</label>
                  <input type="date" name="checkin" id="checkin" className="rounded-md p-2 bg-white/10 text-white border border-white/20" onChange={(e)=>setCheckIn(e.target.value)} value={checkIn || ''} />
                </div>

                {/* Check-out */}
                <div className="flex flex-col">
                  <label className="luxury-text text-xs text-white/80 mb-1">Check-out</label>
                  <input type="date" name="checkout" id="checkout" className="rounded-md p-2 bg-white/10 text-white border border-white/20" onChange={(e)=>setCheckOut(e.target.value)} value={checkOut || ''} />
                </div>

                {/* Guests */}
                <div className="flex flex-col">
                  <label className="luxury-text text-xs text-white/80 mb-1">Guests</label>
                  <select className="rounded-md p-2 bg-white/10 text-white border border-white/20" onChange={(e)=>setGuests(Number(e.target.value))} value={guests}>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>

                <div className="mt-2 md:mt-0">
                  <Button size="lg" className="bg-accent text-white px-6 py-3" onClick={() => handleHeroSearch()}>
                    Search
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="luxury-text text-xs text-white/80 mt-2"></p>
            </div>
          </motion.div>
        </div>

        {/* Down arrow removed as requested */}
      </section>

      {/* Resort Overview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <h2 className="luxury-heading text-4xl md:text-5xl mb-6 text-primary">
              Luxury Redefined
            </h2>
            <p className="luxury-text text-xl text-muted-foreground leading-relaxed">
              Nestled in pristine waters, MHomes Resort offers an unparalleled luxury experience. 
              From overwater villas to world-class amenities, every detail is crafted to perfection.
            </p>
          </motion.div>

                    <div className="grid grid-cols-5 gap-8 lg:gap-12">
            {amenities.map((amenity, index) => (
              <motion.div
                key={amenity.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1  }}
                className="text-center"
              >
                <div className="w-28 h-28 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-6">
                  <amenity.icon className="w-14 h-14 text-accent" />
                </div>
                <h3 className="luxury-heading text-sm font-semibold mb-2">{amenity.name}</h3>
                <p className="luxury-text text-xs text-muted-foreground">{amenity.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section id="story" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <h2 className="luxury-heading text-4xl md:text-5xl mb-6 text-primary">
              What does the <span className="text-accent">M</span> stand for?
            </h2>
            <p className="luxury-text text-xl text-muted-foreground">
              Discover the profound meaning behind MHomes — a fusion of culture, mythology, nature, and visionary dreams.
            </p>
          </motion.div>

          <div className="space-y-16">
            {storyData.map((story, index) => (
              <motion.div
                key={story.word}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? 'md:grid-flow-dense' : ''
                }`}
              >
                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className={`relative h-80 rounded-xl overflow-hidden shadow-2xl ${
                    index % 2 === 1 ? 'md:col-start-2 md:row-start-1' : ''
                  }`}
                >
                  <Image
                    src={story.image}
                    alt={story.word}
                    fill
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}
                >
                  <h3 className="luxury-heading text-4xl md:text-5xl mb-6 text-primary">
                    {story.word.split('').map((char, i) => (
                      <span
                        key={i}
                        className={char === story.word[0] ? 'text-accent text-5xl md:text-6xl' : ''}
                      >
                        {char}
                      </span>
                    ))}
                  </h3>
                  <p className="luxury-text text-lg text-muted-foreground leading-relaxed mb-6">
                    {story.description}
                  </p>
                  <div className="flex items-center gap-2 text-accent">
                    <div className="h-1 w-12 bg-accent rounded-full" />
                    <span className="luxury-heading text-sm">A pillar of MHomes</span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-20 max-w-3xl mx-auto"
          >
            <p className="luxury-text text-lg text-muted-foreground leading-relaxed">
              These four pillars weave together the soul of <span className="text-accent font-semibold">MHomes Resort</span> — 
              where ancient cultural heritage meets contemporary luxury, where nature flows freely, and where dreams transform into unforgettable realities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Accommodations */}
      <section id="accommodations" className="py-24 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="luxury-heading text-4xl md:text-5xl mb-4 text-primary">Exquisite Accommodations</h2>
            <p className="luxury-text text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover your perfect sanctuary with thoughtfully designed rooms tailored to your every need.
            </p>
          </motion.div>

          <div className="space-y-16">
            {accommodationTypes.map((room, idx) => {
              const currentImageIdx = getCarouselIndex(room.name)
              const currentImage = room.images[currentImageIdx]
              
              return (
                <motion.div
                  key={room.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${idx % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}
                >
                  {/* Image Carousel */}
                  <div className={idx % 2 === 1 ? 'lg:col-start-2 lg:row-start-1' : ''}>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl h-96 group">
                      <Image
                        src={currentImage}
                        alt={room.name}
                        fill
                        sizes="(min-width: 1024px) 45vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                      {/* Price Badge */}
                      <div className="absolute top-6 left-6">
                        <Badge className="bg-accent text-white text-lg px-4 py-2">{room.price}</Badge>
                      </div>

                      {/* Carousel Controls */}
                      <button
                        onClick={() => prevImage(room.name, room.images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => nextImage(room.name, room.images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all"
                      >
                        ›
                      </button>

                      {/* Carousel Indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {room.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCarouselIndices(prev => ({ ...prev, [room.name]: i }))}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentImageIdx ? 'bg-accent w-8' : 'bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className={idx % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                    <div className="mb-6">
                      <h3 className="luxury-heading text-4xl md:text-5xl mb-4 text-primary">{room.name}</h3>
                      <p className="luxury-text text-lg text-muted-foreground leading-relaxed">{room.description}</p>
                    </div>

                    {/* Room Specs */}
                    <div className="grid grid-cols-3 gap-6 mb-10 p-6 bg-accent/5 rounded-xl border border-accent/20">
                      <div className="text-center">
                        <p className="luxury-text text-sm text-muted-foreground mb-2">Bed Type</p>
                        <p className="luxury-heading text-xl">{room.bedType}</p>
                      </div>
                      <div className="text-center border-l border-r border-accent/10">
                        <p className="luxury-text text-sm text-muted-foreground mb-2">Size</p>
                        <p className="luxury-heading text-xl">{room.sqft}</p>
                      </div>
                      <div className="text-center">
                        <p className="luxury-text text-sm text-muted-foreground mb-2">Guests</p>
                        <p className="luxury-heading text-xl">{room.maxGuests}</p>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button size="lg" className="bg-accent text-white hover:bg-accent/90 px-12 py-3">
                        Book Now
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/5"
                        onClick={() => setSelectedAmenitiesRoom(room.name)}
                      >
                        View Amenities
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Amenities Modal */}
      {selectedAmenitiesRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto border border-accent/20"
          >
            <div className="sticky top-0 bg-gradient-to-r from-primary/10 to-accent/10 p-8 border-b border-accent/20 flex items-center justify-between">
              <h2 className="luxury-heading text-3xl text-primary">{selectedAmenitiesRoom}</h2>
              <button
                onClick={() => setSelectedAmenitiesRoom(null)}
                className="text-2xl text-muted-foreground hover:text-primary transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-8">
              <h3 className="luxury-heading text-xl mb-8 text-primary">Premium Amenities & Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roomAmenities[selectedAmenitiesRoom as keyof typeof roomAmenities]?.map((amenity, i) => (
                  <motion.div
                    key={amenity}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-accent/10 hover:border-accent/30 transition-colors"
                  >
                    <div className="w-3 h-3 bg-accent rounded-full flex-shrink-0" />
                    <span className="luxury-text">{amenity}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gradient-to-t from-background to-transparent p-6 flex justify-end gap-4 border-t border-accent/20">
              <Button variant="outline" onClick={() => setSelectedAmenitiesRoom(null)}>Close</Button>
              <Button className="bg-accent text-white">Book This Room</Button>
            </div>
          </motion.div>
        </div>
      )}      {/* Dining and Experiences sections removed per request. */}

      {/* Gallery Preview - Carousel Style */}
      <section id="gallery" className="py-20 bg-gradient-to-b from-muted/30 via-background to-muted/30 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="luxury-heading text-4xl md:text-5xl mb-6 text-primary">
              Picture Perfect Moments
            </h2>
            <p className="luxury-text text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore the beauty of MHomes Resort through our curated gallery of stunning imagery.
            </p>
          </motion.div>

          {/* Carousel Data */}
          {(() => {
            // Carousel slides data
            const gallerySlides = [
              {
                key: 'timeless-weddings',
                image: resortImages.villa,
                title: 'TIMELESS WEDDINGS',
                description: 'Celebrate your special day in a setting of unmatched elegance and charm.'
              },
              {
                key: 'taj-holidays',
                image: resortImages.hero,
                title: 'TAJ HOLIDAYS',
                description: 'Go beyond the ordinary and craft enduring memories with a perfectly curated Taj Holiday.'
              },
              {
                key: 'woyage-daycations',
                image: resortImages.beach,
                title: 'WOYAGE - DAYCATIONS',
                description: 'Indulge in a day of luxury and relaxation at our beautiful resort.'
              }
            ];
            const [galleryIndex, setGalleryIndex] = useState(1); // Start with the middle slide
            const slide = gallerySlides[galleryIndex];

            const goLeft = () => setGalleryIndex((i) => (i - 1 + gallerySlides.length) % gallerySlides.length);
            const goRight = () => setGalleryIndex((i) => (i + 1) % gallerySlides.length);

            return (
              <div className="relative flex flex-col items-center justify-center min-h-[600px]">
                {/* Large blurred background image */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[480px] md:w-[80vw] md:h-[600px] rounded-3xl overflow-hidden z-0">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover w-full h-full scale-110 blur-[2px] opacity-70"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/20 to-white/40" />
                </div>

                {/* Carousel content */}
                <div className="relative z-10 flex w-full items-center justify-center">
                  {/* Left arrow */}
                  <button
                    aria-label="Previous"
                    onClick={goLeft}
                    className="flex flex-col items-center justify-center w-16 h-96 group bg-transparent border-none focus:outline-none"
                  >
                    <span className="w-12 h-12 flex items-center justify-center rounded-full border border-primary/40 bg-white/40 group-hover:bg-accent/80 transition-colors shadow-md">
                      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-primary group-hover:text-white"><path d="M15 19l-7-7 7-7" /></svg>
                    </span>
                  </button>

                  {/* Center card */}
                  <div className="w-full max-w-2xl mx-4">
                    <div className="relative flex flex-col items-center justify-end h-[420px] md:h-[500px]">
                      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[90%] h-[70%] rounded-2xl overflow-hidden shadow-xl">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                      </div>
                      <div className="relative z-10 w-full bg-white/95 rounded-b-2xl p-8 flex flex-col items-center justify-center shadow-2xl min-h-[160px]">
                        <h3 className="luxury-heading text-2xl md:text-3xl text-primary mb-2 text-center">{slide.title}</h3>
                        <p className="luxury-text text-base md:text-lg text-muted-foreground text-center mb-4">{slide.description}</p>
                        <Button variant="link" className="text-accent text-lg font-semibold">MORE &gt;</Button>
                      </div>
                    </div>
                  </div>

                  {/* Right arrow */}
                  <button
                    aria-label="Next"
                    onClick={goRight}
                    className="flex flex-col items-center justify-center w-16 h-96 group bg-transparent border-none focus:outline-none"
                  >
                    <span className="w-12 h-12 flex items-center justify-center rounded-full border border-primary/40 bg-white/40 group-hover:bg-accent/80 transition-colors shadow-md">
                      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-primary group-hover:text-white"><path d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </button>
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="luxury-heading text-4xl md:text-5xl mb-6 text-primary">
              Guest Testimonials
            </h2>
            <p className="luxury-text text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover what our guests are saying about their extraordinary experiences at MHomes Resort.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="luxury-card">
                  <CardContent className="pt-6">
                    <Quote className="w-8 h-8 text-accent mb-4" />
                    <p className="luxury-text mb-6">{testimonial.text}</p>
                    <div className="flex items-center gap-2 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                        <span className="luxury-heading text-accent font-semibold">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="luxury-heading text-sm font-semibold">{testimonial.name}</p>
                        <p className="luxury-text text-xs text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Read All Reviews
            </Button>
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section id="booking" className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={resortImages.sunset}
            alt="MHomes Resort Sunset"
            fill
            sizes="100vw"
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="luxury-heading text-4xl md:text-5xl mb-6">
              Your Dream Vacation Awaits
            </h2>
            <p className="luxury-text text-xl mb-8 text-white/90">
              Experience luxury, comfort, and unparalleled service. Book your stay at MHomes Resort today.
            </p>
            
            <div className="glass-effect rounded-xl p-8 max-w-2xl mx-auto mb-8">
              <div className="text-center space-y-6">
                <Award className="w-16 h-16 mx-auto text-accent" />
                <h3 className="luxury-heading text-2xl text-primary">Booking System</h3>
                <p className="luxury-text text-primary">
                  Our advanced booking system is coming soon! In the meantime, contact us directly to make your reservation.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Phone className="w-4 h-4" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Mail className="w-4 h-4" />
                    <span>reservations@mhomesresort.com</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-lg">
                Contact for Booking
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg">
                View Packages
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="luxury-heading text-4xl md:text-5xl mb-6 text-primary">
              Get in Touch
            </h2>
            <p className="luxury-text text-xl text-muted-foreground max-w-3xl mx-auto">
              Ready to experience paradise? Contact us to plan your perfect getaway or learn more about our luxury offerings.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <h3 className="luxury-heading text-2xl mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <MapPin className="w-6 h-6 text-accent" />
                    <div>
                      <p className="luxury-heading font-semibold">Resort Address</p>
                      <p className="luxury-text text-muted-foreground">Tropical Paradise Island, Maldives</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="w-6 h-6 text-accent" />
                    <div>
                      <p className="luxury-heading font-semibold">Phone</p>
                      <p className="luxury-text text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Mail className="w-6 h-6 text-accent" />
                    <div>
                      <p className="luxury-heading font-semibold">Email</p>
                      <p className="luxury-text text-muted-foreground">info@mhomesresort.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="luxury-heading text-lg mb-4">Office Hours</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>12:00 PM - 4:00 PM</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle className="luxury-heading text-xl">Send us a Message</CardTitle>
                  <CardDescription>
                    We'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="luxury-text text-sm font-medium">First Name</label>
                      <Input placeholder="John" />
                    </div>
                    <div>
                      <label className="luxury-text text-sm font-medium">Last Name</label>
                      <Input placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="luxury-text text-sm font-medium">Email</label>
                    <Input type="email" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="luxury-text text-sm font-medium">Subject</label>
                    <Input placeholder="Inquiry about reservation" />
                  </div>
                  <div>
                    <label className="luxury-text text-sm font-medium">Message</label>
                    <Textarea 
                      placeholder="Tell us about your dream vacation..." 
                      rows={4}
                    />
                  </div>
                  <Button className="w-full">
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center overflow-hidden">
                  <Image
                    src="/mhomes-logo.png"
                    alt="MHomes Resort Logo"
                    width={120}
                    height={120}
                    priority
                    style={{ width: 'auto' }}
                    className="object-contain drop-shadow-lg"
                  />
                </div>
              </div>
              <p className="luxury-text text-white/80 mb-4">
                Experience luxury redefined at MHomes Resort, where every moment becomes a treasured memory 
                in our tropical paradise.
              </p>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-white text-white">
                  <Award className="w-3 h-3 mr-1" />
                  5-Star Resort
                </Badge>
                <Badge variant="outline" className="border-white text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  Luxury Certified
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="luxury-heading text-lg mb-4">Quick Links</h4>
              <div className="space-y-2">
                {navigationItems.slice(0, 4).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block luxury-text text-white/80 hover:text-accent transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="luxury-heading text-lg mb-4">More Info</h4>
              <div className="space-y-2">
                {navigationItems.slice(4).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block luxury-text text-white/80 hover:text-accent transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <Separator className="my-8 bg-white/20" />
          
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="luxury-text text-white/60 text-sm">
              © 2025 MHomes Resort. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <Link href="#" className="luxury-text text-white/60 hover:text-accent transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="#" className="luxury-text text-white/60 hover:text-accent transition-colors text-sm">
                Terms of Service
              </Link>
              <Link href="#" className="luxury-text text-white/60 hover:text-accent transition-colors text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  )
}