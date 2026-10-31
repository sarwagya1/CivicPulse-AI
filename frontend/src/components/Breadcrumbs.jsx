import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useLanguage } from '../utils/LanguageContext'

export default function Breadcrumbs({ currentTitle, serviceBadge }) {
  const { t } = useLanguage()

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 mb-4 pb-2 border-b border-slate-200/60">
      <Link
        to="/"
        className="flex items-center gap-1 text-slate-600 hover:text-sky-700 transition-colors font-medium"
      >
        <Home size={13} />
        <span>{t('nav.home')}</span>
      </Link>
      <ChevronRight size={13} className="text-slate-400" />
      <span className="text-slate-800 font-semibold truncate">
        {currentTitle}
      </span>
      {serviceBadge && (
        <span className="hidden sm:inline-flex ml-auto bg-slate-100 text-slate-600 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-slate-200">
          {serviceBadge}
        </span>
      )}
    </nav>
  )
}
