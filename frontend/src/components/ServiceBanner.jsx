import { ShieldAlert, PhoneCall } from 'lucide-react'
import { useLanguage } from '../utils/LanguageContext'

export default function ServiceBanner() {
  const { t } = useLanguage()

  return (
    <div className="bg-slate-900 text-slate-200 text-xs border-b border-slate-800">
      <div className="container mx-auto px-4 max-w-6xl py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-sky-500/20 text-sky-400 font-bold px-2 py-0.5 rounded text-[11px] tracking-wide border border-sky-500/30">
            {t('banner.tag')}
          </span>
          <span className="text-slate-300 font-medium">
            {t('banner.disclaimer')}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-slate-400 text-[11px]">
          <PhoneCall size={12} className="text-amber-400" />
          <span>{t('banner.helplines')}</span>
        </div>
      </div>
    </div>
  )
}
