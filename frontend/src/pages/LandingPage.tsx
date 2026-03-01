/* ===================================
   ORANGE — Premium Landing Page
   Conversion-optimized, SEO-ready.
   =================================== */

import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  FileText,
  Languages,
  Headphones,
  Shield,
  Zap,
  Users,
  BarChart3,
  ArrowRight,
  Check,
  Star,
  Globe2,
  ChevronDown,
} from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';

// ===================================
// HERO
// ===================================

function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-gold-mid/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-gold-dark/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 text-center max-w-4xl px-6"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-border-gold bg-orange-gold-mid/5 text-xs font-medium text-orange-gold-mid mb-8"
        >
          <Zap size={12} />
          Powered by Google Vision · DeepL · ElevenLabs
        </motion.div>

        {/* Logo */}
        <motion.img
          src="/assets/logo.svg"
          alt="ORANGE"
          className="w-72 mx-auto mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-5xl md:text-6xl font-display font-bold leading-tight mb-6"
        >
          <span className="text-orange-text-primary">Ψηφιοποιήστε.</span>{' '}
          <span className="text-gold-gradient bg-[length:200%_auto] animate-shimmer">Μεταφράστε.</span>{' '}
          <span className="text-orange-text-primary">Αφηγηθείτε.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-lg text-orange-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Η premium πλατφόρμα ψηφιακών υπηρεσιών που μετατρέπει τα έγγραφά σας
          σε ψηφιακό κείμενο, τα μεταφράζει σε 30+ γλώσσες, και τα μετατρέπει
          σε audiobook με φυσικές AI φωνές.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <PremiumButton
            variant="primary"
            size="lg"
            icon={<ArrowRight size={18} />}
            onClick={() => window.location.href = '/signup'}
          >
            Ξεκινήστε Δωρεάν — 14 ημέρες
          </PremiumButton>
          <PremiumButton
            variant="ghost"
            size="lg"
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Δείτε πώς λειτουργεί ↓
          </PremiumButton>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center justify-center gap-8 mt-12 text-xs text-orange-text-muted"
        >
          <span className="flex items-center gap-1.5">
            <Shield size={14} /> GDPR Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <Globe2 size={14} /> EU Servers
          </span>
          <span className="flex items-center gap-1.5">
            <Star size={14} /> 99.9% Uptime
          </span>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown size={24} className="text-orange-text-muted/40" />
      </motion.div>
    </section>
  );
}

// ===================================
// SERVICES
// ===================================

const services = [
  {
    icon: FileText,
    title: 'Ψηφιοποίηση & OCR',
    description: 'Μετατρέψτε σαρωμένα έγγραφα και εικόνες σε επεξεργάσιμο κείμενο. Google Cloud Vision με 99%+ ακρίβεια, πλήρης υποστήριξη ελληνικών.',
    stat: '99.2%',
    statLabel: 'Ακρίβεια',
    image: '/assets/icon-ocr.svg',
  },
  {
    icon: Languages,
    title: 'Μετάφραση - Επιμέλεια',
    description: 'Premium μηχανική μετάφραση μέσω DeepL Pro. Η κορυφαία ποιότητα μετάφρασης για ευρωπαϊκές γλώσσες, με διατήρηση μορφοποίησης.',
    stat: '30+',
    statLabel: 'Γλώσσες',
    image: '/assets/icon-translate.svg',
  },
  {
    icon: Headphones,
    title: 'Παραγωγή Audiobook',
    description: 'Μετατρέψτε κείμενο σε ομιλία studio-quality μέσω ElevenLabs. Φυσικές AI φωνές, πολύγλωσση υποστήριξη, ρυθμιζόμενη ταχύτητα.',
    stat: '44.1kHz',
    statLabel: 'Studio Quality',
    image: '/assets/icon-audiobook.svg',
  },
  {
    icon: Shield,
    title: 'Ψηφιακή Θυρίδα',
    description: 'Ασφαλής, κρυπτογραφημένη αποθήκευση εγγράφων. Row-Level Security, signed URLs, πλήρης GDPR συμμόρφωση σε EU servers.',
    stat: 'AES-256',
    statLabel: 'Κρυπτογράφηση',
    image: '/assets/icon-vault.svg',
  },
];

function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="services" ref={ref} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-display font-bold text-orange-text-primary mb-4">
            Τέσσερις υπηρεσίες.{' '}
            <span className="text-gold-gradient bg-[length:200%_auto] animate-shimmer">
              Μία πλατφόρμα.
            </span>
          </h2>
          <p className="text-orange-text-muted max-w-xl mx-auto">
            Κάθε υπηρεσία τροφοδοτείται από τον καλύτερο στην κατηγορία του AI provider.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((svc, idx) => (
            <motion.div
              key={svc.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.15 }}
              className="group relative bg-orange-bg-secondary border border-orange-border rounded-2xl p-8 hover:border-orange-border-gold hover:shadow-premium transition-all duration-500"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(199,173,103,0.06)_0%,transparent_60%)] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative z-10 flex gap-5">
                <div className="flex-shrink-0">
                  <img
                    src={svc.image}
                    alt={svc.title}
                    className="w-16 h-16 object-contain drop-shadow-[0_0_8px_rgba(199,173,103,0.15)]"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-text-primary mb-2">
                    {svc.title}
                  </h3>
                  <p className="text-sm text-orange-text-muted leading-relaxed mb-4">
                    {svc.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-orange-gold-mid font-mono">
                      {svc.stat}
                    </span>
                    <span className="text-xs text-orange-text-muted">
                      {svc.statLabel}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===================================
// ENTERPRISE FEATURES
// ===================================

const enterpriseFeatures = [
  { icon: Zap, title: 'Batch Processing', desc: 'Επεξεργαστείτε εκατοντάδες αρχεία ταυτόχρονα' },
  { icon: Users, title: 'Real-time Collaboration', desc: 'Συνεργαστείτε live σε έγγραφα με την ομάδα σας' },
  { icon: BarChart3, title: 'Usage Analytics', desc: 'Πλήρες dashboard χρήσης και κόστους' },
  { icon: Shield, title: 'Enterprise Security', desc: 'RLS, AES-256, GDPR, EU data residency' },
  { icon: Globe2, title: '30+ Γλώσσες', desc: 'Μετάφραση και text-to-speech σε δεκάδες γλώσσες' },
  { icon: FileText, title: 'API Access', desc: 'RESTful API για integration στα δικά σας συστήματα' },
];

function EnterpriseFeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 px-6 bg-orange-bg-secondary/50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-display font-bold text-orange-text-primary mb-4">
            Enterprise-Grade σε κάθε λεπτομέρεια
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {enterpriseFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.08 }}
                className="bg-orange-bg-primary border border-orange-border rounded-xl p-6 hover:border-orange-border-gold transition-colors"
              >
                <Icon size={22} className="text-orange-gold-mid mb-3" />
                <h3 className="text-sm font-semibold text-orange-text-primary mb-1">
                  {feat.title}
                </h3>
                <p className="text-xs text-orange-text-muted leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ===================================
// TESTIMONIALS
// ===================================

const testimonials = [
  {
    quote: 'Η ακρίβεια του OCR στα ελληνικά είναι εντυπωσιακή. Εξοικονομούμε ώρες κάθε εβδομάδα.',
    name: 'Μαρία Κ.',
    role: 'Δικηγορικό Γραφείο',
    rating: 5,
  },
  {
    quote: 'Η μετάφραση μέσω DeepL είναι κατά πολύ ανώτερη από ό,τι χρησιμοποιούσαμε πριν. Η ποιότητα είναι σχεδόν ανθρώπινη.',
    name: 'Γιώργος Π.',
    role: 'Εκδοτικός Οίκος',
    rating: 5,
  },
  {
    quote: 'Δημιουργούμε audiobooks σε μια μέρα αντί για εβδομάδες. Game changer.',
    name: 'Αθηνά Λ.',
    role: 'Content Producer',
    rating: 5,
  },
];

function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-display font-bold text-orange-text-primary mb-4">
            Τι λένε οι πελάτες μας
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.15 }}
              className="bg-orange-bg-secondary border border-orange-border rounded-xl p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }, (_, i) => (
                  <Star key={i} size={14} className="fill-orange-gold-mid text-orange-gold-mid" />
                ))}
              </div>
              <p className="text-sm text-orange-text-secondary leading-relaxed mb-4 italic">
                "{t.quote}"
              </p>
              <div>
                <p className="text-sm font-semibold text-orange-text-primary">{t.name}</p>
                <p className="text-xs text-orange-text-muted">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===================================
// CTA
// ===================================

function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        className="max-w-3xl mx-auto text-center bg-orange-bg-secondary border border-orange-border-gold rounded-3xl p-12 shadow-glow"
      >
        <h2 className="text-3xl font-display font-bold text-orange-text-primary mb-4">
          Έτοιμοι να ξεκινήσετε;
        </h2>
        <p className="text-orange-text-muted mb-8 max-w-lg mx-auto">
          14 ημέρες δωρεάν δοκιμή. Χωρίς πιστωτική κάρτα. Ακύρωση οποτεδήποτε.
        </p>
        <PremiumButton
          variant="primary"
          size="lg"
          icon={<ArrowRight size={18} />}
          onClick={() => window.location.href = '/signup'}
        >
          Δημιουργήστε Δωρεάν Λογαριασμό
        </PremiumButton>
      </motion.div>
    </section>
  );
}

// ===================================
// FOOTER
// ===================================

function LandingFooter() {
  return (
    <footer className="border-t border-orange-border py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <img src="/assets/logo.svg" alt="ORANGE" className="w-24 mb-3" />
            <p className="text-xs text-orange-text-muted leading-relaxed">
              Premium ψηφιακές υπηρεσίες για επιχειρήσεις. OCR, Μετάφραση, Audiobook, Ασφαλής Αποθήκευση.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-orange-text-secondary tracking-wider uppercase mb-3">
              Υπηρεσίες
            </h4>
            <ul className="space-y-2 text-xs text-orange-text-muted">
              <li><a href="#" className="hover:text-orange-gold-mid transition-colors">OCR & Ψηφιοποίηση</a></li>
              <li><a href="#" className="hover:text-orange-gold-mid transition-colors">Μετάφραση</a></li>
              <li><a href="#" className="hover:text-orange-gold-mid transition-colors">Audiobook</a></li>
              <li><a href="#" className="hover:text-orange-gold-mid transition-colors">Ψηφιακή Θυρίδα</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold text-orange-text-secondary tracking-wider uppercase mb-3">
              Εταιρεία
            </h4>
            <ul className="space-y-2 text-xs text-orange-text-muted">
              <li><a href="#" className="hover:text-orange-gold-mid transition-colors">Σχετικά</a></li>
              <li><a href="#" className="hover:text-orange-gold-mid transition-colors">Τιμολόγηση</a></li>
              <li><a href="#" className="hover:text-orange-gold-mid transition-colors">Επικοινωνία</a></li>
              <li><a href="#" className="hover:text-orange-gold-mid transition-colors">API Docs</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-orange-text-secondary tracking-wider uppercase mb-3">
              Νομικά
            </h4>
            <ul className="space-y-2 text-xs text-orange-text-muted">
              <li><a href="#" className="hover:text-orange-gold-mid transition-colors">Πολιτική Απορρήτου</a></li>
              <li><a href="#" className="hover:text-orange-gold-mid transition-colors">Όροι Χρήσης</a></li>
              <li><a href="#" className="hover:text-orange-gold-mid transition-colors">GDPR</a></li>
              <li><a href="#" className="hover:text-orange-gold-mid transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-orange-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-orange-text-muted">
            © 2026 ORANGE · Θεόδωρος Στογιάννου · Φλώρινα, Ελλάδα
          </p>
          <p className="text-xs text-orange-text-muted">
            Designed with precision. Built for professionals.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ===================================
// LANDING PAGE (Assembled)
// ===================================

export function LandingPage() {
  return (
    <div className="min-h-screen bg-orange-bg-primary text-orange-text-primary overflow-y-auto scrollbar-thin">
      <HeroSection />
      <ServicesSection />
      <EnterpriseFeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}