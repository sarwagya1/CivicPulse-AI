import { Link } from 'react-router-dom'
import {
  FileText,
  AlertTriangle,
  Search,
  BookOpen,
  ArrowRight,
  Zap,
  ShieldCheck,
  Globe,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Layers,
  Clock,
  Compass
} from 'lucide-react'
import { useLanguage } from '../utils/LanguageContext'

export default function Home() {
  const { t } = useLanguage()

  const services = [
    {
      icon: BookOpen,
      titleKey: 'home.features.schemes.title',
      descKey: 'home.features.schemes.desc',
      path: '/schemes',
      tag: 'myScheme.gov.in API',
      actionText: t('home.features.schemes.action'),
      accentColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      borderHover: 'hover:border-emerald-400',
      iconBg: 'bg-emerald-100 text-emerald-800',
    },
    {
      icon: AlertTriangle,
      titleKey: 'home.features.grievance.title',
      descKey: 'home.features.grievance.desc',
      path: '/grievance',
      tag: 'DistilBERT & Vision AI',
      actionText: t('home.features.grievance.action'),
      accentColor: 'text-orange-700',
      badgeBg: 'bg-orange-50 text-orange-800 border-orange-200',
      borderHover: 'hover:border-orange-400',
      iconBg: 'bg-orange-100 text-orange-800',
    },
    {
      icon: FileText,
      titleKey: 'home.features.policy.title',
      descKey: 'home.features.policy.desc',
      path: '/policy',
      tag: 'facebook/bart-large-cnn',
      actionText: t('home.features.policy.action'),
      accentColor: 'text-sky-700',
      badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
      borderHover: 'hover:border-sky-400',
      iconBg: 'bg-sky-100 text-sky-800',
    },
    {
      icon: Search,
      titleKey: 'home.features.factCheck.title',
      descKey: 'home.features.factCheck.desc',
      path: '/fact-check',
      tag: 'cross-encoder & Wikipedia',
      actionText: t('home.features.factCheck.action'),
      accentColor: 'text-purple-700',
      badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
      borderHover: 'hover:border-purple-400',
      iconBg: 'bg-purple-100 text-purple-800',
    },
  ]

  const stats = [
    { labelKey: 'home.statsModels', value: '4+', icon: Zap, detail: 'BART, DistilBERT, MarianMT, Cross-Encoder' },
    { labelKey: 'home.statsApis',   value: '3',  icon: Globe, detail: 'myScheme, data.gov.in, Wikipedia' },
    { labelKey: 'home.statsNoMock', value: '100%', icon: ShieldCheck, detail: 'Verified public datasets & portals' },
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-sky-900 via-slate-900 to-slate-950 text-white p-8 md:p-14 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-semibold px-3.5 py-1.5 rounded-full">
            <Zap size={13} className="text-sky-400" />
            <span>{t('home.badge')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            <span>{t('home.title1')}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
              {t('home.title2')}
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
            {t('home.subtitle')}
          </p>

          {/* Trust Highlights */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              <CheckCircle2 size={13} className="text-emerald-400" />
              {t('home.trustBadge1')}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              <CheckCircle2 size={13} className="text-emerald-400" />
              {t('home.trustBadge2')}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              <CheckCircle2 size={13} className="text-emerald-400" />
              {t('home.trustBadge3')}
            </span>
          </div>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/schemes"
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-sky-500/20 transition-all duration-150 active:scale-[0.98]"
            >
              <span>{t('home.getStarted')}</span>
              <ArrowRight size={16} />
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-3 rounded-lg border border-slate-700 transition-all duration-150"
            >
              <span>{t('home.apiDocs')}</span>
            </a>
          </div>
        </div>

        {/* Subtle decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Stats Highlights */}
      <section aria-label="System Metrics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map(({ labelKey, value, icon: Icon, detail }) => (
            <div
              key={labelKey}
              className="card flex items-start gap-4 p-5 hover:border-slate-300 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0 text-sky-700">
                <Icon size={24} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {value}
                </div>
                <div className="text-sm font-semibold text-slate-700 mt-0.5">
                  {t(labelKey)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Citizen Services Journey (GOV.UK / myScheme Card System) */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-800 uppercase tracking-wider mb-1">
            <Compass size={14} />
            <span>Digital Public Services</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {t('home.featuresHeading')}
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            {t('home.featuresSubheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map(({
            icon: Icon,
            titleKey,
            descKey,
            path,
            tag,
            actionText,
            accentColor,
            badgeBg,
            borderHover,
            iconBg
          }) => (
            <Link
              key={path}
              to={path}
              className={`card group flex flex-col justify-between ${borderHover} transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-600`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
                    <Icon size={22} />
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
                    {tag}
                  </span>
                </div>

                <div>
                  <h3 className={`text-xl font-bold text-slate-900 group-hover:${accentColor} transition-colors flex items-center gap-1.5`}>
                    {t(titleKey)}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mt-2">
                    {t(descKey)}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-sky-700 group-hover:text-sky-800">
                <span>{actionText}</span>
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How CivicPulse AI Works (GOV.UK Service Step Pattern) */}
      <section className="card bg-slate-900 text-white p-8 md:p-10 space-y-8 border-slate-800">
        <div>
          <span className="text-sky-400 text-xs font-bold uppercase tracking-wider">
            Verified Service Architecture
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            {t('home.howItWorks')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2.5 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-sm border border-sky-500/30">
              1
            </div>
            <h3 className="font-bold text-base text-slate-100">
              {t('home.step1Title')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('home.step1Desc')}
            </p>
          </div>

          <div className="space-y-2.5 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-sm border border-sky-500/30">
              2
            </div>
            <h3 className="font-bold text-base text-slate-100">
              {t('home.step2Title')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('home.step2Desc')}
            </p>
          </div>

          <div className="space-y-2.5 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-sm border border-sky-500/30">
              3
            </div>
            <h3 className="font-bold text-base text-slate-100">
              {t('home.step3Title')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('home.step3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack & Model Transparency */}
      <section className="card space-y-4">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-sky-700" />
          <h2 className="text-lg font-bold text-slate-900">
            {t('home.techStack')}
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          CivicPulse AI runs production HuggingFace models locally or on-demand, integrated with live government endpoints.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            'FastAPI (Python)', 'React 18 + Vite', 'TailwindCSS v3', 'HuggingFace Transformers',
            'facebook/bart-large-cnn', 'Helsinki-NLP/opus-mt-en-hi',
            'cross-encoder/ms-marco-MiniLM-L-6-v2', 'distilbert-base-uncased',
            'data.gov.in API', 'myscheme.gov.in API', 'Wikipedia REST API',
          ].map(tech => (
            <span
              key={tech}
              className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
