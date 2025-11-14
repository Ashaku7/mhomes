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
  Waves, 
  Utensils,
  Heart,
  Dumbbell,
  MessageCircle,
  ChevronDown,
  Calendar,
  Users,
  ArrowRight,
  Quote,
  Award,
  Shield,
  Clock,
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
    { name: 'Accommodations', href: '#accommodations', icon: '🏨' },
    { name: 'Dining', href: '#dining', icon: '🍽️' },
    { name: 'Experiences', href: '#experiences', icon: '🌊' },
    { name: 'Gallery', href: '#gallery', icon: '📸' },
    { name: 'Reviews', href: '#reviews', icon: '⭐' },
    { name: 'Booking', href: '#booking', icon: '📅' },
    { name: 'Contact', href: '#contact', icon: '📞' }
  ]

  const accommodationTypes = [
    {
      name: 'Ocean Villa',
      description: 'Luxurious overwater villas with private infinity pools and panoramic ocean views',
      image: resortImages.villa,
      price: '$1,200',
      features: ['Private Pool', 'Ocean View', '150 sqm', 'Butler Service']
    },
    {
      name: 'Beach Suite',
      description: 'Elegant beachfront suites with direct beach access and premium amenities',
      image: resortImages.beach,
      price: '$800',
      features: ['Beach Access', 'King Bed', '80 sqm', 'Balcony']
    },
    {
      name: 'Premium Room',
      description: 'Sophisticated rooms with modern amenities and garden or pool views',
      image: resortImages.pool,
      price: '$450',
      features: ['Pool View', 'Queen Bed', '45 sqm', 'Mini Bar']
    },
    {
      name: 'Deluxe Studio',
      description: 'Comfortable studios perfect for couples seeking luxury and convenience',
      image: resortImages.pier,
      price: '$320',
      features: ['Garden View', 'Double Bed', '35 sqm', 'Work Desk']
    }
  ]

  const diningOptions = [
    {
      name: 'Azure Restaurant',
      type: 'Fine Dining',
      description: 'Michelin-starred cuisine with breathtaking ocean views',
      cuisine: 'International Fusion',
      hours: '6:00 PM - 11:00 PM'
    },
    {
      name: 'Sunset Lounge',
      type: 'Bar & Grill',
      description: 'Casual dining with craft cocktails and fresh seafood',
      cuisine: 'Mediterranean',
      hours: '12:00 PM - 2:00 AM'
    },
    {
      name: 'Poolside Café',
      type: 'Casual Dining',
      description: 'Light meals and refreshing beverages by the infinity pool',
      cuisine: 'Continental',
      hours: '7:00 AM - 6:00 PM'
    }
  ]

  const experiences = [
    {
      name: 'Spa & Wellness',
      description: 'Rejuvenating treatments inspired by ancient healing traditions',
      icon: Heart,
      image: resortImages.sunset
    },
    {
      name: 'Water Sports',
      description: 'Diving, snorkeling, kayaking, and sailing adventures',
      icon: Waves,
      image: resortImages.beach
    },
    {
      name: 'Fitness Center',
      description: 'State-of-the-art equipment with personal trainers available',
      icon: Dumbbell,
      image: resortImages.pool
    },
    {
      name: 'Cultural Tours',
      description: 'Explore local culture, history, and hidden gems with expert guides',
      icon: MapPin,
      image: resortImages.pier
    }
  ]

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
    { icon: Waves, name: 'Private Beach', description: 'Exclusive beach access' },
    { icon: Utensils, name: 'Multiple Restaurants', description: '5-star dining experiences' },
    { icon: Heart, name: 'Luxury Spa', description: 'Award-winning wellness center' },
    { icon: Dumbbell, name: 'Fitness Center', description: '24/7 state-of-the-art gym' }
  ]

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'accommodations', 'dining', 'experiences', 'gallery', 'reviews', 'booking', 'contact']
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

      {/* Hero Section */}
      <section id="home" className="relative h-screen overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0">
          <Image
            src={resortImages.hero}
            alt="MHomes Resort Paradise"
            fill
            sizes="100vw"
            className="object-cover"
            priority
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </motion.div>
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: shouldAnimateHome ? [1, 1.02, 1] : 1
            }}
            transition={{ 
              duration: shouldAnimateHome ? 0.8 : 1.2,
              scale: shouldAnimateHome ? { duration: 0.8, ease: "easeInOut" } : undefined
            }}
            className="max-w-6xl mx-auto"
          >
            <motion.h1 
              className="luxury-heading text-7xl md:text-9xl lg:text-[10rem] mb-6 tracking-wider font-light hero-text-shadow mhomes-brown"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              mhomes
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mb-12"
            >
              <h2 className="luxury-heading text-2xl md:text-3xl lg:text-4xl mb-4 font-light tracking-wide hero-text-shadow">
                An Immortal Paradise by the Sea
              </h2>
              <p className="luxury-text text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed hero-text-shadow">
                Experience luxury redefined at MHomes Resort, where every moment becomes a treasured memory in our tropical paradise
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Button 
                size="lg" 
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 px-12 py-6 text-lg transition-all duration-300 hover:scale-105"
              >
                Book Your Stay
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/50 text-white hover:bg-white hover:text-primary px-12 py-6 text-lg transition-all duration-300 hover:scale-105"
              >
                Virtual Tour
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {amenities.map((amenity, index) => (
              <motion.div
                key={amenity.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <amenity.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="luxury-heading text-sm font-semibold mb-2">{amenity.name}</h3>
                <p className="luxury-text text-xs text-muted-foreground">{amenity.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accommodations */}
      <section id="accommodations" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="luxury-heading text-4xl md:text-5xl mb-6 text-primary">
              Exquisite Accommodations
            </h2>
            <p className="luxury-text text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from our carefully curated selection of rooms and villas, each offering uncompromising luxury and breathtaking views.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {accommodationTypes.map((accommodation, index) => (
              <motion.div
                key={accommodation.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="luxury-card overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={accommodation.image}
                      alt={accommodation.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-accent text-white">
                        {accommodation.price}/night
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="luxury-heading text-xl">{accommodation.name}</CardTitle>
                    <CardDescription className="luxury-text">
                      {accommodation.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {accommodation.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                          <span className="luxury-text text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dining */}
      <section id="dining" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="luxury-heading text-4xl md:text-5xl mb-6 text-primary">
              Culinary Excellence
            </h2>
            <p className="luxury-text text-xl text-muted-foreground max-w-3xl mx-auto">
              Embark on a gastronomic journey with our world-renowned chefs and diverse dining experiences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {diningOptions.map((restaurant, index) => (
              <motion.div
                key={restaurant.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="luxury-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="luxury-heading text-xl">{restaurant.name}</CardTitle>
                      <Badge variant="outline">{restaurant.type}</Badge>
                    </div>
                    <CardDescription className="luxury-text">
                      {restaurant.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-accent" />
                      <span className="luxury-text text-sm">{restaurant.cuisine}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      <span className="luxury-text text-sm">{restaurant.hours}</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      Make Reservation
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences */}
      <section id="experiences" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="luxury-heading text-4xl md:text-5xl mb-6 text-primary">
              Unforgettable Experiences
            </h2>
            <p className="luxury-text text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover a world of possibilities with our curated experiences designed to create lasting memories.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {experiences.map((experience, index) => (
              <motion.div
                key={experience.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="luxury-card overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={experience.image}
                      alt={experience.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <experience.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="luxury-heading text-xl">{experience.name}</CardTitle>
                    <CardDescription className="luxury-text">
                      {experience.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section id="gallery" className="py-20 bg-background">
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(resortImages).map(([key, image], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer"
              >
                <Image
                  src={image}
                  alt={`MHomes Resort ${key}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              View Full Gallery
            </Button>
          </div>
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