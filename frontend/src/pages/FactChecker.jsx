import { useState } from 'react'
import {
  Search,
  Loader2,
  ExternalLink,
  CheckCircle,
  XCircle,
  HelpCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Info
} from 'lucide-react'
import api from '../utils/api'
import { useLanguage } from '../utils/LanguageContext'
import Breadcrumbs from '../components/Breadcrumbs'
import VoiceDictationButton from '../components/VoiceDictationButton'

const VERDICT_CONFIG = {
  VERIFIED: {
    icon: CheckCircle,
    color: 'text-emerald-700',
    badge: 'badge-verified',
    bg: 'border-emerald-300 bg-emerald-50/50',
    barColor: 'bg-emerald-600',
  },
  FALSE: {
    icon: XCircle,
    color: 'text-red-700',
    badge: 'badge-false',
    bg: 'border-red-300 bg-red-50/50',
    barColor: 'bg-red-600',
  },
  UNVERIFIED: {
    icon: HelpCircle,
    color: 'text-slate-700',
    badge: 'badge-unverified',
    bg: 'border-slate-300 bg-slate-50/50',
    barColor: 'bg-slate-500',
  },
  NEEDS_MORE_CONTEXT: {
    icon: AlertCircle,
    color: 'text-amber-800',
    badge: 'badge-needs',
    bg: 'border-amber-300 bg-amber-50/50',
    barColor: 'bg-amber-600',
  },
}

export default function FactChecker() {
  const { t } = useLanguage()
  const [claim, setClaim] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function applySample(type) {
    if (type === 'sample1') {
      setClaim('India launched Chandrayaan-3 in 2023 and became the first country to land near the lunar south pole.')
    } else if (type === 'sample2') {
      setClaim('Aditya-L1 is an Indian spacecraft mission dedicated to studying the Sun solar atmosphere.')
    } else if (type === 'sample3') {
      setClaim('COVID-19 vaccines contain secret microchips designed to track citizens via 5G networks.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!claim.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.post('/fact/check', { claim })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || t('factCheck.errorBackend'))
    } finally {
      setLoading(false)
    }
  }

  const cfg = result ? (VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.UNVERIFIED) : null
  const Icon = cfg?.icon

  function verdictLabel(verdict) {
    return t(`factCheck.verdicts.${verdict}`) || verdict.replace('_', ' ')
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs currentTitle={t('factCheck.title')} serviceBadge="Cross-Encoder AI & Live Wikipedia" />

      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
          <Search size={13} />
          <span>Public Truth &amp; Claim Verification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('factCheck.title')}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          {t('factCheck.subtitle')}
        </p>
      </div>

      {/* Quick Test Samples */}
      <div className="card bg-slate-50 border-slate-200/80 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            Quick Example Claims (1-Click Fill)
          </span>
          <span className="text-[11px] text-slate-500">Test cross-encoder matching</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applySample('sample1')}
            className="btn-subtle hover:bg-purple-50 hover:text-purple-900 border border-slate-200"
          >
            🚀 {t('factCheck.sample1')}
          </button>
          <button
            type="button"
            onClick={() => applySample('sample2')}
            className="btn-subtle hover:bg-purple-50 hover:text-purple-900 border border-slate-200"
          >
            ☀️ {t('factCheck.sample2')}
          </button>
          <button
            type="button"
            onClick={() => applySample('sample3')}
            className="btn-subtle hover:bg-purple-50 hover:text-purple-900 border border-slate-200"
          >
            💉 {t('factCheck.sample3')}
          </button>
        </div>
      </div>

      {/* Input Form (GOV.UK Textarea Pattern) */}
      <form onSubmit={handleSubmit} className="card space-y-4 border-slate-200 shadow-sm bg-white">
        <label className="block">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <span className="form-label mb-0">{t('factCheck.label')}</span>
            <div className="flex items-center gap-2">
              <VoiceDictationButton
                onTranscript={(spoken) => {
                  setClaim((prev) => (prev ? `${prev.trim()} ${spoken}` : spoken))
                }}
                targetLabel={t('factCheck.label')}
              />
              {claim.length > 0 && (
                <button
                  type="button"
                  onClick={() => setClaim('')}
                  className="text-xs text-slate-400 hover:text-red-600 font-medium transition-colors"
                >
                  {t('factCheck.clearText')}
                </button>
              )}
            </div>
          </div>
          <textarea
            className="input-field h-28 resize-y text-slate-800 leading-relaxed font-normal"
            placeholder={t('factCheck.placeholder')}
            value={claim}
            onChange={e => setClaim(e.target.value)}
          />
          <span className="form-hint">
            Enter a viral headline, statement, or quote to verify against reliable reference articles.
          </span>
        </label>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            className="btn-primary w-full sm:w-auto px-7 py-2.5"
            disabled={loading || !claim.trim()}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span>{loading ? t('factCheck.submitting') : t('factCheck.submit')}</span>
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold">Verification Error: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Verification Result */}
      {result && cfg && (
        <div className="space-y-6">
          {/* Main Verdict Card */}
          <div className={`card border ${cfg.bg} p-6 space-y-4 shadow-sm`}>
            <div className="flex items-start gap-4">
              <Icon size={36} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={cfg.badge}>{verdictLabel(result.verdict)}</span>
                  <span className="text-slate-600 text-xs font-semibold">
                    {t('factCheck.confidence')} {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {t('factCheck.claimLabel')}{' '}
                  <span className="italic font-medium text-slate-800">&ldquo;{result.claim}&rdquo;</span>
                </h2>

                <p className="text-slate-700 text-sm leading-relaxed pt-1">
                  {result.explanation}
                </p>
              </div>
            </div>
          </div>

          {/* Confidence Score Bar */}
          <div className="card p-5 space-y-2 border-slate-200 bg-white">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>{t('factCheck.confidenceScore')}</span>
              <span className={cfg.color}>{(result.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-700 ${cfg.barColor}`}
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
          </div>

          {/* Evidence Sources from Wikipedia */}
          {result.sources.length > 0 && (
            <div className="card p-6 space-y-4 border-slate-200 bg-white">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen size={18} className="text-sky-700" />
                  <span>{t('factCheck.sourcesTitle')}</span>
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {result.sources.length} Verified Articles Checked
                </span>
              </div>

              <div className="space-y-3">
                {result.sources.map((src, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-800 font-bold hover:underline inline-flex items-center gap-1.5 text-sm"
                      >
                        <span>{src.title}</span>
                        <ExternalLink size={13} className="text-slate-400" />
                      </a>
                      <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 w-fit">
                        {t('factCheck.relevance')} {(src.relevance_score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {src.snippet}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
