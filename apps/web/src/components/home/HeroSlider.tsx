'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Phone, User, Mail, ChevronDown, CheckCircle } from 'lucide-react';

const SLIDES = [
  {
    video:  'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4',
    poster: 'https://images.unsplash.com/photo-1544922404-f97e0e1e3462?w=1400&q=80',
    line1:  'Discover the',
    line2:  'Soul of India',
    sub:    'From snow-capped Himalayas to golden beaches of Goa — explore Incredible India with our curated tour packages.',
  },
  {
    video:  'https://videos.pexels.com/video-files/1918465/1918465-uhd_2560_1440_30fps.mp4',
    poster: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1400&q=80',
    line1:  'Sun, Sand &',
    line2:  'Serenity Awaits',
    sub:    "Feel the golden shores of Goa and drift into India's beach paradise with hand-crafted packages.",
  },
  {
    video:  'https://videos.pexels.com/video-files/2169880/2169880-uhd_2560_1440_30fps.mp4',
    poster: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1400&q=80',
    line1:  'Land of Royals',
    line2:  '& Heritage',
    sub:    'Walk through majestic forts, royal palaces and the eternal symbol of love across incredible India.',
  },
];

const DESTINATIONS = ['Manali', 'Goa', 'Rajasthan', 'Kerala', 'Ladakh', 'Andaman', 'Meghalaya', 'Rishikesh', 'Other'];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Enquiry form state
  const [enquiryName, setEnquiryName]         = useState('');
  const [enquiryPhone, setEnquiryPhone]       = useState('');
  const [enquiryEmail, setEnquiryEmail]       = useState('');
  const [enquiryDest, setEnquiryDest]         = useState('');
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [enquiryLoading, setEnquiryLoading]   = useState(false);
  const [enquiryError, setEnquiryError]       = useState('');

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === current) { v.currentTime = 0; v.play().catch(() => {}); }
      else v.pause();
    });
  }, [current]);

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryError('');
    
    // Validation
    if (!enquiryName.trim()) {
      setEnquiryError('Please enter your name');
      return;
    }
    if (!enquiryPhone.trim()) {
      setEnquiryError('Phone number is required');
      return;
    }
    if (enquiryPhone.length < 10) {
      setEnquiryError('Please enter valid 10-digit phone number');
      return;
    }
    if (enquiryEmail && !/^\S+@\S+\.\S+$/.test(enquiryEmail)) {
      setEnquiryError('Please enter valid email address');
      return;
    }
    
    setEnquiryLoading(true);
    
    try {
      // Send to API endpoint (will forward to admin email)
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: enquiryName,
          phone: enquiryPhone,
          email: enquiryEmail,
          destination: enquiryDest,
          source: 'Hero Banner',
          timestamp: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send enquiry');
      }
      
      setEnquirySubmitted(true);
      
      // Reset form after 4s
      setTimeout(() => {
        setEnquirySubmitted(false);
        setEnquiryName('');
        setEnquiryPhone('');
        setEnquiryEmail('');
        setEnquiryDest('');
      }, 4000);
      
    } catch (error) {
      console.error('Enquiry error:', error);
      setEnquiryError('Failed to submit enquiry. Please try again.');
    } finally {
      setEnquiryLoading(false);
    }
  };

  return (
    <section className="bg-[#F5F7FA] px-4 pb-6 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-container">
        <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '420px' }}>

          {/* ── Video slides ──────────────────────────────────────── */}
          {SLIDES.map((slide, idx) => (
            <div key={idx} className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: idx === current ? 1 : 0, zIndex: idx === current ? 1 : 0 }}>
              <video ref={(el) => { videoRefs.current[idx] = el; }}
                src={slide.video} poster={slide.poster}
                muted loop playsInline preload={idx === 0 ? 'auto' : 'none'}
                className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,20,40,0.88) 0%, rgba(10,20,40,0.55) 55%, rgba(0,0,0,0.2) 100%)' }} />
            </div>
          ))}

          {/* ── Foreground ────────────────────────────────────────── */}
          <div className="relative flex h-full min-h-[420px] flex-col justify-center px-6 pb-12 pt-6 sm:px-10 lg:px-12" style={{ zIndex: 10 }}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              {/* Left: text + CTAs */}
              <div className="flex-1 max-w-lg">
                <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                  🚌 India Domestic Tours Only
                </div>
                <h1 className="mb-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                  {SLIDES[current].line1}{' '}
                  <br />
                  <span style={{ color: '#FF8C00' }}>{SLIDES[current].line2}</span>
                </h1>
                <p className="mb-5 max-w-md text-sm leading-relaxed text-gray-300 sm:text-base">
                  {SLIDES[current].sub}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/trips"
                    className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-colors"
                    style={{ backgroundColor: '#FF6B00' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E65100')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF6B00')}>
                    🚌 Explore Packages
                  </Link>
                  <a href="#enquiry"
                    className="flex items-center gap-2 rounded-lg border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                    Quick Enquiry ↓
                  </a>
                </div>
              </div>

              {/* Right: Enquiry form card */}
              <div id="enquiry" className="w-full lg:w-80 xl:w-96 shrink-0">
                <div className="rounded-2xl bg-white/95 p-5 shadow-2xl backdrop-blur-md">
                  {enquirySubmitted ? (
                    <div className="flex flex-col items-center py-4 text-center">
                      <CheckCircle className="mb-3 h-12 w-12 text-green-500" />
                      <h3 className="font-bold text-gray-900">Enquiry Received!</h3>
                      <p className="mt-1 text-sm text-gray-500">Our team will call you within 24 hours.</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="mb-1 text-base font-bold text-gray-900">Quick Enquiry</h3>
                      <p className="mb-4 text-xs text-gray-500">Get a free callback from our travel expert</p>
                      
                      {enquiryError && (
                        <div className="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-600">
                          {enquiryError}
                        </div>
                      )}

                      <form onSubmit={handleEnquiry} className="space-y-3">
                        {/* Name */}
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 focus-within:border-[#FF6B00] focus-within:ring-1 focus-within:ring-[#FF6B00]">
                          <User className="h-4 w-4 shrink-0 text-gray-400" />
                          <input type="text" placeholder="Your Name *" value={enquiryName}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^a-zA-Z\s.'-]/g, ''); // Allow letters, spaces, apostrophes, dots, hyphens
                              setEnquiryName(value);
                            }}
                            pattern="[A-Za-z\s.'-]+"
                            title="Please enter your name (letters, spaces, apostrophes, dots or hyphens only)"
                            required className="w-full bg-transparent text-sm focus:outline-none" />
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 focus-within:border-[#FF6B00] focus-within:ring-1 focus-within:ring-[#FF6B00]">
                          <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                          <input type="tel" placeholder="Phone Number *" value={enquiryPhone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                              setEnquiryPhone(value.slice(0, 10)); // Limit to 10 digits
                            }}
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            maxLength={10}
                            title="Please enter 10-digit phone number (digits only)"
                            required className="w-full bg-transparent text-sm focus:outline-none" />
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 focus-within:border-[#FF6B00] focus-within:ring-1 focus-within:ring-[#FF6B00]">
                          <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                          <input type="email" placeholder="Email (optional)" value={enquiryEmail}
                            onChange={(e) => setEnquiryEmail(e.target.value)}
                            inputMode="email"
                            className="w-full bg-transparent text-sm focus:outline-none" />
                        </div>

                        {/* Destination */}
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 focus-within:border-[#FF6B00] focus-within:ring-1 focus-within:ring-[#FF6B00]">
                          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                          <select value={enquiryDest} onChange={(e) => setEnquiryDest(e.target.value)}
                            className="w-full bg-transparent text-sm text-gray-600 focus:outline-none">
                            <option value="">Select Destination</option>
                            {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>

                        <button type="submit" disabled={enquiryLoading}
                          className="w-full rounded-lg py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-70"
                          style={{ backgroundColor: '#FF6B00' }}>
                          {enquiryLoading ? 'Submitting...' : '📞 Request Free Callback'}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-8 z-20 flex items-center gap-2 sm:left-10 lg:left-12">
            {SLIDES.map((_, idx) => (
              <button key={idx} onClick={() => setCurrent(idx)} aria-label={`Slide ${idx + 1}`}
                className="rounded-full transition-all duration-300"
                style={{ height: '6px', width: idx === current ? '28px' : '6px',
                  backgroundColor: idx === current ? '#FF6B00' : 'rgba(255,255,255,0.4)' }} />
            ))}
          </div>
          <div className="absolute bottom-4 right-5 z-20 text-xs font-semibold tracking-wide text-white/60">
            {current + 1} / {SLIDES.length}
          </div>
        </div>
      </div>
    </section>
  );
}
