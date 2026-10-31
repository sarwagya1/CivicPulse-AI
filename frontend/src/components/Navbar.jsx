import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Activity,
  FileText,
  AlertTriangle,
  Search,
  BookOpen,
  Globe,
  Menu,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'
import { useLanguage } from '../utils/LanguageContext'

export default function Navbar() {
  const { pathname } = useLocation()
  const { lang, setLang, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const navItems = [
    { path: '/',           labelKey: 'nav.home',      icon: Activity },
    { path: '/schemes',    labelKey: 'nav.schemes',   icon: BookOpen },
    { path: '/grievance',  labelKey: 'nav.grievance', icon: AlertTriangle },
    { path: '/policy',     labelKey: 'nav.policy',    icon: FileText },
    { path: '/fact-check', labelKey: 'nav.factCheck', icon: Search },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-sm">
      {/* Skip to Main Content Link for Keyboard Accessibility (GOV.UK design pattern) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 z-50 bg-sky-700 text-white font-semibold px-4 py-2 rounded shadow-lg focus:outline-none ring-2 ring-white"
      >
        {t('common.skipToContent')}
      </a>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo & Identity */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-sky-600 rounded-lg p-1"
            aria-label="CivicPulse AI Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-700 to-sky-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-150">
              <ShieldCheck size={22} className="text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg md:text-xl text-slate-900 tracking-tight leading-tight">
                  CivicPulse
                </span>
                <span className="bg-sky-100 text-sky-800 text-[11px] font-bold px-1.5 py-0.5 rounded border border-sky-300">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Citizen Governance Intelligence
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map(({ path, labelKey, icon: Icon }) => {
              const isActive = pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 relative ${
                    isActive
                      ? 'bg-sky-50 text-sky-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    size={16}
                    className={isActive ? 'text-sky-700' : 'text-slate-400 group-hover:text-slate-600'}
                  />
                  <span>{t(labelKey)}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-sky-700 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Controls: Language Switcher & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            {/* Language Switcher Button */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 hover:border-slate-400 transition-all duration-150 shadow-sm"
              title={lang === 'en' ? 'हिंदी में बदलें (Switch to Hindi)' : 'Switch to English'}
              aria-label={lang === 'en' ? 'Switch language to Hindi' : 'Switch language to English'}
            >
              <Globe size={14} className="text-sky-700" />
              <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.menu')}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-1">
            {navItems.map(({ path, labelKey, icon: Icon }) => {
              const isActive = pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-800'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    size={18}
                    className={isActive ? 'text-sky-700' : 'text-slate-500'}
                  />
                  <span>{t(labelKey)}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </header>
  )
}
