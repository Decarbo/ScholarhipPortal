import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import pmTribalVisionImg from '../../assets/pm-tribal-vision.png';
import {
  GraduationCap,
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowRight,
  Building2,
  Globe,
  Clock,
} from 'lucide-react';

/* ============================================================
 *  1. PRIME MINISTER & NATIONAL VISION SECTION
 * ============================================================ */
export const PrimeMinisterHero: React.FC = () => {
  const { t } = useTranslation('student');
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#024969] via-[#056C9A] to-[#0B75A4] text-white shadow-xl border border-[#056C9A]/60 transition-all duration-300 hover:shadow-2xl">
      {/* Indian Tricolor Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#E25A18] via-white to-[#38C88B]" />

      <div className="p-6 md:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* PM Official Image Column */}
          <div className="lg:col-span-5 flex flex-col items-center text-center">
            <div className="relative group w-full max-w-md">
              {/* Outer decorative ring */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#E25A18]/40 via-[#1697C5]/40 to-[#38C88B]/40 blur-sm opacity-70 group-hover:opacity-100 transition duration-500" />

              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#024969] border-2 border-[#1697C5]/50 shadow-2xl flex items-center justify-center">
                {!imgError ? (
                  <img
                    src={pmTribalVisionImg}
                    alt={t('udaanHome.hero.pmTitle')}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    onError={() => setImgError(true)}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#024969] to-[#012638] text-center">
                    <div className="w-16 h-16 rounded-full bg-[#E25A18]/20 border border-[#E25A18]/50 flex items-center justify-center mb-3">
                      <GraduationCap className="text-[#E25A18]" size={32} />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{t('udaanHome.hero.pmName')}</span>
                    <span className="text-[10px] text-[#1697C5] mt-1">{t('udaanHome.hero.pmTitle')}</span>
                  </div>
                )}

                {/* Bottom badge */}
                <div className="absolute bottom-0 inset-x-0 bg-[#024969]/90 backdrop-blur-sm py-1.5 px-3 border-t border-[#056C9A] text-center">
                  <p className="text-xs font-bold text-white tracking-wide">{t('udaanHome.hero.pmName')}</p>
                  <p className="text-[10px] text-[#1697C5] font-medium">{t('udaanHome.hero.pmTitle')}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-medium backdrop-blur-xs">
              <Sparkles size={12} className="text-[#38C88B]" />
              <span>{t('udaanHome.hero.mission')}</span>
            </div>
          </div>

          {/* PM Vision & Neutral Governance Text Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 text-white border border-white/20 tracking-wide uppercase">
                {t('udaanHome.hero.initiative')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#024969]/80 text-[#DEE2E6] border border-[#056C9A]">
                {t('udaanHome.hero.ministry')}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {t('udaanHome.hero.title')}
              </h2>
              <p className="text-sm text-[#DEE2E6] font-medium mt-1">
                {t('udaanHome.hero.subtitle')}
              </p>
            </div>

            <div className="relative pl-4 border-l-4 border-[#E25A18] bg-[#024969]/50 p-3.5 rounded-r-xl">
              <Quote size={20} className="text-[#1697C5] mb-1" />
              <p className="text-sm sm:text-base text-white/95 leading-relaxed italic">
                &ldquo;{t('udaanHome.hero.quote')}&rdquo;
              </p>
              <p className="text-xs font-semibold text-[#1697C5] mt-2 text-right">
                {t('udaanHome.hero.quoteAuthor')}
              </p>
            </div>

            {/* Key Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-2.5 rounded-lg bg-[#024969]/60 border border-[#1697C5]/30 text-center hover:border-[#1697C5] transition-colors">
                <ShieldCheck size={18} className="text-[#38C88B] mx-auto mb-1" />
                <p className="text-xs font-bold text-white">{t('udaanHome.hero.pillar1Title')}</p>
                <p className="text-[10px] text-[#DEE2E6]">{t('udaanHome.hero.pillar1Desc')}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#024969]/60 border border-[#1697C5]/30 text-center hover:border-[#1697C5] transition-colors">
                <CheckCircle2 size={18} className="text-[#1697C5] mx-auto mb-1" />
                <p className="text-xs font-bold text-white">{t('udaanHome.hero.pillar2Title')}</p>
                <p className="text-[10px] text-[#DEE2E6]">{t('udaanHome.hero.pillar2Desc')}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#024969]/60 border border-[#1697C5]/30 text-center hover:border-[#1697C5] transition-colors">
                <Award size={18} className="text-[#E25A18] mx-auto mb-1" />
                <p className="text-xs font-bold text-white">{t('udaanHome.hero.pillar3Title')}</p>
                <p className="text-[10px] text-[#DEE2E6]">{t('udaanHome.hero.pillar3Desc')}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#024969]/60 border border-[#1697C5]/30 text-center hover:border-[#1697C5] transition-colors">
                <Globe size={18} className="text-[#1697C5] mx-auto mb-1" />
                <p className="text-xs font-bold text-white">{t('udaanHome.hero.pillar4Title')}</p>
                <p className="text-[10px] text-[#DEE2E6]">{t('udaanHome.hero.pillar4Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
 *  2. ABOUT UDAAN SCHOLAR PORTAL SECTION
 * ============================================================ */
export const AboutUdaanSection: React.FC = () => {
  const { t } = useTranslation('student');
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#DEE2E6] dark:border-slate-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#0B75A4]/10 dark:bg-[#0B75A4]/25 border border-[#0B75A4]/30 text-[#0B75A4] dark:text-[#1697C5] text-xs font-semibold uppercase tracking-wider mb-1">
            <GraduationCap size={13} />
            <span>{t('udaanHome.about.badge')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t('udaanHome.about.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t('udaanHome.about.subtitle')}
          </p>
        </div>
        <button
          onClick={() => navigate('/student/schemes')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B75A4] dark:text-[#1697C5] hover:text-[#056C9A] dark:hover:text-[#3aa8d2] transition-colors"
        >
          {t('udaanHome.about.exploreSchemes')} <ArrowRight size={13} />
        </button>
      </div>

      {/* Explanatory Paragraphs & Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Centralized Architecture */}
        <div className="bg-white dark:bg-slate-800/90 rounded-xl p-5 border border-[#DEE2E6] dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-[#0B75A4] dark:hover:border-[#1697C5] transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#0B75A4]/10 text-[#0B75A4] dark:text-[#1697C5] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Building2 size={20} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {t('udaanHome.about.card1Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('udaanHome.about.card1Desc')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#DEE2E6]/60 dark:border-slate-700/60 flex items-center text-[11px] font-medium text-[#0B75A4] dark:text-[#1697C5]">
            <CheckCircle2 size={13} className="mr-1.5" /> {t('udaanHome.about.card1Badge')}
          </div>
        </div>

        {/* Card 2: Paperless & AI Services */}
        <div className="bg-white dark:bg-slate-800/90 rounded-xl p-5 border border-[#DEE2E6] dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-[#0B75A4] dark:hover:border-[#1697C5] transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#1697C5]/15 text-[#056C9A] dark:text-[#1697C5] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles size={20} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {t('udaanHome.about.card2Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('udaanHome.about.card2Desc')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#DEE2E6]/60 dark:border-slate-700/60 flex items-center text-[11px] font-medium text-[#056C9A] dark:text-[#1697C5]">
            <CheckCircle2 size={13} className="mr-1.5" /> {t('udaanHome.about.card2Badge')}
          </div>
        </div>

        {/* Card 3: Transparency & Assistance */}
        <div className="bg-white dark:bg-slate-800/90 rounded-xl p-5 border border-[#DEE2E6] dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-[#0B75A4] dark:hover:border-[#1697C5] transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#38C88B]/15 text-[#1e7a54] dark:text-[#38C88B] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {t('udaanHome.about.card3Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('udaanHome.about.card3Desc')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#DEE2E6]/60 dark:border-slate-700/60 flex items-center text-[11px] font-medium text-[#1e7a54] dark:text-[#38C88B]">
            <CheckCircle2 size={13} className="mr-1.5" /> {t('udaanHome.about.card3Badge')}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
 *  3. GOVERNMENT EVENTS & UPDATES SECTION
 * ============================================================ */
export const GovernmentEventsSection: React.FC = () => {
  const { t } = useTranslation('student');
  const navigate = useNavigate();

  const events = [
    {
      id: 'ev-1',
      category: t('udaanHome.events.ev1Category'),
      badgeColor: 'bg-[#38C88B]/15 text-[#1e7a54] dark:text-[#38C88B] border-[#38C88B]/40',
      date: t('udaanHome.events.ev1Date'),
      title: t('udaanHome.events.ev1Title'),
      description: t('udaanHome.events.ev1Desc'),
      linkText: t('udaanHome.events.ev1Action'),
      route: '/student/schemes',
    },
    {
      id: 'ev-2',
      category: t('udaanHome.events.ev2Category'),
      badgeColor: 'bg-[#0B75A4]/15 text-[#0B75A4] dark:text-[#1697C5] border-[#0B75A4]/40',
      date: t('udaanHome.events.ev2Date'),
      title: t('udaanHome.events.ev2Title'),
      description: t('udaanHome.events.ev2Desc'),
      linkText: t('udaanHome.events.ev2Action'),
      route: '/student/tracker',
    },
    {
      id: 'ev-3',
      category: t('udaanHome.events.ev3Category'),
      badgeColor: 'bg-[#E25A18]/15 text-[#b0400d] dark:text-[#ff8a50] border-[#E25A18]/40',
      date: t('udaanHome.events.ev3Date'),
      title: t('udaanHome.events.ev3Title'),
      description: t('udaanHome.events.ev3Desc'),
      linkText: t('udaanHome.events.ev3Action'),
      route: '/student/apply',
    },
    {
      id: 'ev-4',
      category: t('udaanHome.events.ev4Category'),
      badgeColor: 'bg-[#056C9A]/15 text-[#056C9A] dark:text-[#1697C5] border-[#056C9A]/40',
      date: t('udaanHome.events.ev4Date'),
      title: t('udaanHome.events.ev4Title'),
      description: t('udaanHome.events.ev4Desc'),
      linkText: t('udaanHome.events.ev4Action'),
      route: '/student/tracker',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEE2E6] dark:border-slate-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#E25A18]/10 dark:bg-[#E25A18]/20 border border-[#E25A18]/30 text-[#b0400d] dark:text-[#ff8a50] text-xs font-semibold uppercase tracking-wider mb-1">
            <Calendar size={13} />
            <span>{t('udaanHome.events.badge')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t('udaanHome.events.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t('udaanHome.events.subtitle')}
          </p>
        </div>
      </div>

      {/* Responsive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="group bg-white dark:bg-slate-800 rounded-xl p-5 border border-[#DEE2E6] dark:border-slate-700 shadow-xs hover:shadow-md hover:border-[#0B75A4] dark:hover:border-[#1697C5] transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Meta Top */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${ev.badgeColor}`}>
                  {ev.category}
                </span>
                <span className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Clock size={12} className="mr-1 text-slate-400" />
                  {ev.date}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#0B75A4] dark:group-hover:text-[#1697C5] transition-colors">
                {ev.title}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {ev.description}
              </p>
            </div>

            {/* Action */}
            <div className="mt-4 pt-3 border-t border-[#DEE2E6]/60 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                {t('udaanHome.events.ministryTag')}
              </span>
              <button
                onClick={() => navigate(ev.route)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B75A4] dark:text-[#1697C5] hover:text-[#056C9A] dark:hover:text-[#3aa8d2] transition-colors"
              >
                {ev.linkText} <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
 *  4. STUDENT REVIEW / TESTIMONIAL SLIDER
 * ============================================================ */
export const StudentReviewSlider: React.FC = () => {
  const { t } = useTranslation('student');

  const testimonials = [
    {
      id: 't-1',
      name: t('udaanHome.reviews.r1Name'),
      role: t('udaanHome.reviews.r1Role'),
      scheme: t('udaanHome.reviews.r1Scheme'),
      location: t('udaanHome.reviews.r1Location'),
      rating: 5,
      initials: 'AS',
      avatarGradient: 'from-[#024969] to-[#0B75A4]',
      feedback: t('udaanHome.reviews.r1Feedback'),
    },
    {
      id: 't-2',
      name: t('udaanHome.reviews.r2Name'),
      role: t('udaanHome.reviews.r2Role'),
      scheme: t('udaanHome.reviews.r2Scheme'),
      location: t('udaanHome.reviews.r2Location'),
      rating: 5,
      initials: 'RM',
      avatarGradient: 'from-[#056C9A] to-[#1697C5]',
      feedback: t('udaanHome.reviews.r2Feedback'),
    },
    {
      id: 't-3',
      name: t('udaanHome.reviews.r3Name'),
      role: t('udaanHome.reviews.r3Role'),
      scheme: t('udaanHome.reviews.r3Scheme'),
      location: t('udaanHome.reviews.r3Location'),
      rating: 5,
      initials: 'SM',
      avatarGradient: 'from-[#024969] to-[#056C9A]',
      feedback: t('udaanHome.reviews.r3Feedback'),
    },
    {
      id: 't-4',
      name: t('udaanHome.reviews.r4Name'),
      role: t('udaanHome.reviews.r4Role'),
      scheme: t('udaanHome.reviews.r4Scheme'),
      location: t('udaanHome.reviews.r4Location'),
      rating: 5,
      initials: 'PN',
      avatarGradient: 'from-[#0B75A4] to-[#1697C5]',
      feedback: t('udaanHome.reviews.r4Feedback'),
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto sliding every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, testimonials.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEE2E6] dark:border-slate-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#38C88B]/15 text-[#1e7a54] dark:text-[#38C88B] border border-[#38C88B]/40 text-xs font-semibold uppercase tracking-wider mb-1">
            <Star size={13} className="fill-[#38C88B] text-[#38C88B]" />
            <span>{t('udaanHome.reviews.badge')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t('udaanHome.reviews.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t('udaanHome.reviews.subtitle')}
          </p>
        </div>

        {/* Manual Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-lg border border-[#DEE2E6] dark:border-slate-600 hover:bg-[#F8F8F8] hover:border-[#0B75A4] dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
            aria-label={t('udaanHome.reviews.prevReview')}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-1">
            {currentIndex + 1} / {testimonials.length}
          </span>
          <button
            onClick={handleNext}
            className="p-2 rounded-lg border border-[#DEE2E6] dark:border-slate-600 hover:bg-[#F8F8F8] hover:border-[#0B75A4] dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
            aria-label={t('udaanHome.reviews.nextReview')}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Slider Container with pause on hover */}
      <div
        className="relative bg-white dark:bg-slate-800 rounded-2xl border border-[#DEE2E6] dark:border-slate-700 p-6 md:p-8 shadow-xs hover:shadow-md transition-all duration-300"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Profile Column */}
          <div className="md:col-span-4 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-[#DEE2E6]/60 dark:border-slate-700/80 pb-6 md:pb-0 md:pr-6">
            {/* Avatar with gradient and initials */}
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${current.avatarGradient} text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-[#0B75A4]/20 mb-3 border-2 border-white dark:border-slate-700`}>
              {current.initials}
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {current.name}
            </h3>
            <p className="text-xs text-[#0B75A4] dark:text-[#1697C5] font-semibold mt-0.5">
              {current.role}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <MapPin size={11} className="text-slate-400" />
              {current.location}
            </p>

            {/* Scheme Tag */}
            <div className="mt-3 px-2.5 py-1 rounded-full bg-[#0B75A4]/10 dark:bg-slate-700/60 border border-[#0B75A4]/25 dark:border-slate-600 text-[10px] font-semibold text-[#0B75A4] dark:text-[#1697C5]">
              {current.scheme}
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-1 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < current.rating
                      ? 'fill-[#E25A18] text-[#E25A18]'
                      : 'text-slate-300 dark:text-slate-600'
                  }
                />
              ))}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1.5">
                5.0
              </span>
            </div>
          </div>

          {/* Feedback Quote Column */}
          <div className="md:col-span-8 flex flex-col justify-center space-y-4">
            <Quote size={28} className="text-[#0B75A4]/30 dark:text-[#1697C5]/30" />
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200 leading-relaxed italic">
              &ldquo;{current.feedback}&rdquo;
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 border-t border-[#DEE2E6]/60 dark:border-slate-700/60">
              <span className="inline-flex items-center gap-1 text-[#1e7a54] dark:text-[#38C88B] font-semibold">
                <CheckCircle2 size={13} className="text-[#38C88B]" /> {t('udaanHome.reviews.verifiedBeneficiary')}
              </span>
              <span>{t('udaanHome.reviews.dbtConfirmed')}</span>
            </div>
          </div>
        </div>

        {/* Indicator Dots */}
        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-[#DEE2E6]/60 dark:border-slate-700/60">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 transition-all rounded-full cursor-pointer ${
                i === currentIndex
                  ? 'w-8 bg-[#0B75A4] dark:bg-[#1697C5]'
                  : 'w-2 bg-[#DEE2E6] dark:bg-slate-600 hover:bg-[#0B75A4]/50'
              }`}
              aria-label={t('udaanHome.reviews.goToSlide', { slide: i + 1 })}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================
 *  5. OFFICIAL GOVERNMENT PORTAL FOOTER
 * ============================================================ */
export const UdaanGovernmentFooter: React.FC = () => {
  const { t } = useTranslation('student');
  const navigate = useNavigate();

  return (
    <footer className="mt-12 rounded-2xl overflow-hidden bg-gradient-to-b from-[#024969] via-[#056C9A] to-[#012638] text-slate-200 border border-[#056C9A] shadow-xl">
      {/* Tricolor Ribbon Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#E25A18] via-white to-[#38C88B]" />

      <div className="p-6 md:p-10 space-y-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand & Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#024969] via-[#056C9A] to-[#0B75A4] flex items-center justify-center text-white shadow-md shadow-[#024969]/50 border border-white/20">
                <GraduationCap size={20} className="stroke-[2.2]" />
              </div>
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white">UDAAN</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#024969] text-white rounded border border-[#1697C5]/40 tracking-wider">MoTA</span>
                </div>
                <span className="text-[9px] font-bold tracking-widest text-[#1697C5] uppercase mt-0.5">SCHOLAR PORTAL</span>
              </div>
            </div>

            <p className="text-xs text-[#DEE2E6] leading-relaxed">
              {t('udaanHome.footer.tagline')}
            </p>

            <div className="pt-1">
              <p className="text-[11px] font-semibold text-white uppercase tracking-wider mb-2">
                {t('udaanHome.footer.connectMoTA')}
              </p>
              <div className="flex items-center gap-2 text-white">
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-[#024969] hover:bg-[#0B75A4] border border-[#056C9A] flex items-center justify-center text-xs transition-colors">
                  𝕏
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-[#024969] hover:bg-[#0B75A4] border border-[#056C9A] flex items-center justify-center text-xs transition-colors">
                  f
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-[#024969] hover:bg-[#0B75A4] border border-[#056C9A] flex items-center justify-center text-xs transition-colors">
                  ▶
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-[#024969] hover:bg-[#0B75A4] border border-[#056C9A] flex items-center justify-center text-xs transition-colors">
                  in
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links & Government Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#056C9A] pb-2">
              {t('udaanHome.footer.nationalPortals')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://scholarships.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#DEE2E6] hover:text-[#1697C5] transition-colors">
                  <ExternalLink size={12} className="text-[#1697C5]" /> {t('udaanHome.footer.nsp')}
                </a>
              </li>
              <li>
                <a href="https://tribal.nic.in" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#DEE2E6] hover:text-[#1697C5] transition-colors">
                  <ExternalLink size={12} className="text-[#1697C5]" /> {t('udaanHome.footer.mota')}
                </a>
              </li>
              <li>
                <a href="https://digilocker.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#DEE2E6] hover:text-[#1697C5] transition-colors">
                  <ExternalLink size={12} className="text-[#1697C5]" /> {t('udaanHome.footer.digilocker')}
                </a>
              </li>
              <li>
                <a href="https://dbtbharat.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#DEE2E6] hover:text-[#1697C5] transition-colors">
                  <ExternalLink size={12} className="text-[#1697C5]" /> {t('udaanHome.footer.dbtBharat')}
                </a>
              </li>
              <li>
                <a href="https://mygov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#DEE2E6] hover:text-[#1697C5] transition-colors">
                  <ExternalLink size={12} className="text-[#1697C5]" /> {t('udaanHome.footer.mygov')}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Schemes & Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#056C9A] pb-2">
              {t('udaanHome.footer.schemesSupport')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/student/schemes')} className="text-[#DEE2E6] hover:text-[#1697C5] transition-colors text-left cursor-pointer">
                  {t('udaanHome.footer.nfst')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/student/schemes')} className="text-[#DEE2E6] hover:text-[#1697C5] transition-colors text-left cursor-pointer">
                  {t('udaanHome.footer.nos')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/student/schemes')} className="text-[#DEE2E6] hover:text-[#1697C5] transition-colors text-left cursor-pointer">
                  {t('udaanHome.footer.topClass')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/student/vault')} className="text-[#DEE2E6] hover:text-[#1697C5] transition-colors text-left cursor-pointer">
                  {t('udaanHome.footer.vault')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/student/grievances')} className="text-[#DEE2E6] hover:text-[#1697C5] transition-colors text-left cursor-pointer">
                  {t('udaanHome.footer.cpgrams')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#056C9A] pb-2">
              {t('udaanHome.footer.helpdeskContact')}
            </h4>
            <div className="space-y-2.5 text-xs text-[#DEE2E6]">
              <div className="flex items-start gap-2">
                <Phone size={14} className="text-[#1697C5] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold">{t('udaanHome.footer.tollFree')}</p>
                  <p className="text-[11px] text-[#DEE2E6]">{t('udaanHome.footer.timing')}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail size={14} className="text-[#1697C5] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold">{t('udaanHome.footer.supportEmail')}</p>
                  <p className="text-[11px] text-[#DEE2E6]">{t('udaanHome.footer.portalSupport')}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-[#1697C5] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold">{t('udaanHome.hero.ministry')}</p>
                  <p className="text-[11px] text-[#DEE2E6] leading-tight">{t('udaanHome.footer.address')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Policy Links */}
        <div className="pt-6 border-t border-[#056C9A] flex flex-wrap items-center justify-between gap-4 text-xs text-[#DEE2E6]">
          <div className="flex flex-wrap items-center gap-4">
            <span className="hover:text-white cursor-pointer">{t('udaanHome.footer.privacyPolicy')}</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">{t('udaanHome.footer.termsConditions')}</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">{t('udaanHome.footer.accessibility')}</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">{t('udaanHome.footer.hyperlinking')}</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">{t('udaanHome.footer.disclaimer')}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[#DEE2E6] bg-[#024969] px-2.5 py-1 rounded-md border border-[#056C9A]">
            <CheckCircle2 size={12} className="text-[#38C88B]" />
            <span>{t('udaanHome.footer.compliance')}</span>
          </div>
        </div>

        {/* Copyright Bottom Bar */}
        <div className="pt-4 border-t border-[#056C9A]/60 text-center text-xs text-[#DEE2E6]">
          <p>{t('udaanHome.footer.copyright')}</p>
          <p className="text-[11px] text-[#DEE2E6] mt-1">
            {t('udaanHome.footer.subCopyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};
