import { Link } from 'react-router-dom'
import { ShieldCheck, ExternalLink, Activity, BookOpen, AlertTriangle, FileText, Search, Heart } from 'lucide-react'
import { useLanguage } from '../utils/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  const services = [
    { path: '/schemes',    labelKey: 'nav.schemes',   icon: BookOpen },
    { path: '/grievance',  labelKey: 'nav.grievance', icon: AlertTriangle },
    { path: '/policy',     labelKey: 'nav.policy',    icon: FileText },
    { path: '/fact-check', labelKey: 'nav.factCheck', icon: Search },
  ]

  const officialSources = [
    { name: 'myScheme Portal', url: 'https://www.myscheme.gov.in/' },
    { name: 'Open Government Data (data.gov.in)', url: 'https://data.gov.in/' },
    { name: 'CPGRAMS Public Grievance', url: 'https://pgportal.gov.in/' },
    { name: 'National Portal of India', url: 'https://www.india.gov.in/' },
  ]

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16 pt-12 pb-8">
      <div className="container mx-auto px-4 max-w-6xl space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Mission & Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-700 flex items-center justify-center text-white">
                <ShieldCheck size={18} className="text-sky-300" />
              </div>
              <span className="font-extrabold text-lg text-white">
                CivicPulse <span className="text-sky-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              {t('footer.missionDesc')}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-md text-xs text-slate-400 border border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real Government APIs • Zero Mock Data</span>
            </div>
          </div>

          {/* Quick Services */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Citizen Services
            </h3>
            <ul className="space-y-2 text-sm">
              {services.map(({ path, labelKey, icon: Icon }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    <Icon size={14} className="text-slate-500" />
                    <span>{t(labelKey)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Verified Sources */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {t('footer.officialSourcesTitle')}
            </h3>
            <ul className="space-y-2 text-sm">
              {officialSources.map(({ name, url }) => (
                <li key={name}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    <span>{name}</span>
                    <ExternalLink size={12} className="text-slate-500" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer & Compliance Box */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p>{t('footer.complianceNotice')}</p>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline flex items-center gap-1 flex-shrink-0 font-medium"
          >
            FastAPI OpenAPI Docs <ExternalLink size={12} />
          </a>
        </div>

        {/* Bottom Credits & Tagline */}
        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 space-y-1">
          <p>{t('footer.text')}</p>
          <p className="text-[11px] text-slate-600">{t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  )
}
