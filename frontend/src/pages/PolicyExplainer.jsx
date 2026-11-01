import { useState } from 'react'
import {
  FileText,
  Languages,
  Loader2,
  ChevronRight,
  Info,
  Users,
  IndianRupee,
  ClipboardList,
  Calendar,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  BookOpen
} from 'lucide-react'
import api from '../utils/api'
import { useLanguage } from '../utils/LanguageContext'
import Breadcrumbs from '../components/Breadcrumbs'
import VoiceDictationButton from '../components/VoiceDictationButton'

export default function PolicyExplainer() {
  const { lang, t } = useLanguage()
  const [text, setText] = useState('')
  const [translateHindi, setTranslateHindi] = useState(lang === 'hi')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Quick document presets for instant testing
  function applySample(type) {
    if (type === 'pmkisan') {
      setText(
        'The Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a Central Sector scheme with 100% funding from the Government of India. Under the scheme, income support of ₹6,000 per year is provided to all landholding farmer families across the country in three equal installments of ₹2,000 every four months. The fund is transferred directly to the bank accounts of the beneficiaries through Direct Benefit Transfer (DBT). All landholding farmer families having cultivable landholding in their names are eligible. Affluent farmers, institutional landholders, and income tax payees are excluded. Eligible farmers can apply online via the PM-KISAN portal or through Common Service Centres (CSC).'
      )
    } else if (type === 'nep') {
      setText(
        'The National Education Policy (NEP) 2020 aims to achieve 100% Gross Enrolment Ratio (GER) in preschool to secondary education by 2030. Higher education institutions will move towards multidisciplinary universities and colleges, with undergraduate degree programs offering multiple exit options: a certificate after completing 1 year, an advanced diploma after 2 years, a Bachelor degree after 3 years, and a Bachelor degree with research after 4 years. An Academic Bank of Credit (ABC) shall be established to digitally store academic credits earned from various recognized higher education institutions so that degrees can be awarded taking into account credits earned.'
      )
    } else if (type === 'rti') {
      setText(
        'Under Section 4 of the Right to Information Act 2005, every public authority shall maintain all its records duly catalogued and indexed in a manner and the form which facilitates the right to information. It shall publish within one hundred and twenty days from the enactment of this Act the particulars of its organization, functions, duties, powers and duties of its officers and employees, the procedure followed in the decision making process, including channels of supervision and accountability, and a statement of the categories of documents that are held by it or under its control.'
      )
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    const shouldTranslate = translateHindi || lang === 'hi'

    try {
      const res = await api.post('/policy/explain', {
        text,
        translate_to_hindi: shouldTranslate,
        max_length: 400,
      })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || t('policy.errorBackend'))
    } finally {
      setLoading(false)
    }
  }

  /** Render a list section only when items exist and are non-trivial */
  function ListSection({ icon: Icon, color, title, items, notSpecifiedText }) {
    if (!items || items.length === 0) return null
    const isEmpty = items.length === 1 && items[0].toLowerCase().includes('not specified')
    if (isEmpty) {
      return (
        <div className="card border-slate-200 bg-slate-50/50 opacity-70 p-4">
          <h2 className={`${color} font-bold text-sm mb-1.5 flex items-center gap-2`}>
            <Icon size={16} /> {title}
          </h2>
          <p className="text-slate-500 text-xs italic">{notSpecifiedText || items[0]}</p>
        </div>
      )
    }
    return (
      <div className="card p-5 space-y-3 border-slate-200 bg-white">
        <h2 className={`${color} font-bold text-base flex items-center gap-2`}>
          <Icon size={18} /> {title}
        </h2>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-slate-700 text-sm leading-relaxed">
              <ChevronRight size={15} className={`${color} mt-1 flex-shrink-0`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  function TextSection({ icon: Icon, color, title, text: body }) {
    if (!body || body.toLowerCase().includes('not specified')) return null
    return (
      <div className="card p-5 space-y-2 border-slate-200 bg-white">
        <h2 className={`${color} font-bold text-base flex items-center gap-2`}>
          <Icon size={18} /> {title}
        </h2>
        <p className="text-slate-700 text-sm leading-relaxed">{body}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs currentTitle={t('policy.title')} serviceBadge="HuggingFace BART Summarization" />

      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
          <FileText size={13} />
          <span>Plain Language Public Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('policy.title')}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          {t('policy.subtitle')}
        </p>
      </div>

      {/* Quick Test Samples */}
      <div className="card bg-slate-50 border-slate-200/80 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            Sample Official Notifications (1-Click Fill)
          </span>
          <span className="text-[11px] text-slate-500">Test AI summarizer</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applySample('pmkisan')}
            className="btn-subtle hover:bg-sky-50 hover:text-sky-900 border border-slate-200"
          >
            📋 {t('policy.sample1Title')}
          </button>
          <button
            type="button"
            onClick={() => applySample('nep')}
            className="btn-subtle hover:bg-sky-50 hover:text-sky-900 border border-slate-200"
          >
            🎓 {t('policy.sample2Title')}
          </button>
          <button
            type="button"
            onClick={() => applySample('rti')}
            className="btn-subtle hover:bg-sky-50 hover:text-sky-900 border border-slate-200"
          >
            ⚖️ {t('policy.sample3Title')}
          </button>
        </div>
      </div>

      {/* Input Form (GOV.UK Textarea Pattern) */}
      <form onSubmit={handleSubmit} className="card space-y-5 border-slate-200 shadow-sm bg-white">
        <label className="block">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <span className="form-label mb-0">{t('policy.label')}</span>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <VoiceDictationButton
                onTranscript={(spoken) => {
                  setText((prev) => (prev ? `${prev.trim()} ${spoken}` : spoken))
                }}
                targetLabel={t('policy.label')}
              />
              <span>{text.length} {t('policy.charCount')}</span>
              {text.length > 0 && (
                <button
                  type="button"
                  onClick={() => setText('')}
                  className="text-slate-400 hover:text-red-600 font-medium transition-colors"
                >
                  {t('policy.clearText')}
                </button>
              )}
            </div>
          </div>
          <textarea
            className="input-field h-48 resize-y text-slate-800 font-normal leading-relaxed"
            placeholder={t('policy.placeholder')}
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <span className="form-hint">{t('policy.guidanceTip')}</span>
        </label>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={translateHindi || lang === 'hi'}
              onChange={e => setTranslateHindi(e.target.checked)}
              className="w-4 h-4 rounded text-sky-700 focus:ring-sky-600 border-slate-300"
            />
            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 flex items-center gap-1.5">
              <Languages size={15} className="text-sky-700" />
              <span>{t('policy.translateHindi')}</span>
            </span>
          </label>

          <button
            type="submit"
            className="btn-primary w-full sm:w-auto px-7 py-2.5"
            disabled={loading || !text.trim()}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            <span>{loading ? t('policy.submitting') : t('policy.submit')}</span>
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold">Analysis Error: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Plain English Summary */}
          <div className="card border-sky-300 bg-sky-50/40 p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sky-950 font-bold text-lg flex items-center gap-2">
                <FileText size={20} className="text-sky-700" />
                {t('policy.sectionSummary')}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                AI Abstractive Summary
              </span>
            </div>
            <p className="text-slate-800 text-base leading-relaxed font-normal">
              {result.summary_english}
            </p>
          </div>

          {/* Hindi Summary */}
          {result.summary_hindi && (
            <div className="card border-amber-300 bg-amber-50/40 p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-amber-950 font-bold text-lg flex items-center gap-2">
                  <Languages size={20} className="text-amber-700" />
                  {t('policy.sectionHindi')}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Helsinki-NLP opus-mt-en-hi
                </span>
              </div>
              <p className="text-slate-900 text-base sm:text-lg leading-relaxed font-normal">
                {result.summary_hindi}
              </p>
            </div>
          )}

          {/* Structured Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Purpose */}
            <TextSection
              icon={Info}
              color="text-indigo-800"
              title={t('policy.sectionPurpose')}
              text={result.purpose}
            />

            {/* Who is affected */}
            <TextSection
              icon={Users}
              color="text-sky-800"
              title={t('policy.sectionWhoAffected')}
              text={result.who_is_affected}
            />

            {/* Key Benefits */}
            <ListSection
              icon={IndianRupee}
              color="text-emerald-800"
              title={t('policy.sectionBenefits')}
              items={result.key_benefits}
              notSpecifiedText={t('policy.notSpecified')}
            />

            {/* Procedures */}
            <ListSection
              icon={ClipboardList}
              color="text-blue-800"
              title={t('policy.sectionProcedures')}
              items={result.procedures}
              notSpecifiedText={t('policy.notSpecified')}
            />

            {/* Deadlines */}
            <ListSection
              icon={Calendar}
              color="text-amber-800"
              title={t('policy.sectionDeadlines')}
              items={result.deadlines}
              notSpecifiedText={t('policy.notSpecified')}
            />

            {/* Practical Example */}
            <TextSection
              icon={Lightbulb}
              color="text-amber-700"
              title={t('policy.sectionExample')}
              text={result.practical_example}
            />
          </div>

          {/* Key Points */}
          {result.key_points && result.key_points.length > 0 && (
            <div className="card p-6 space-y-3 border-slate-200 bg-white">
              <h2 className="text-slate-900 font-bold text-lg flex items-center gap-2">
                <CheckCircle2 size={18} className="text-sky-700" />
                {t('policy.sectionKeyPoints')}
              </h2>
              <ul className="space-y-2.5">
                {result.key_points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-slate-700 text-sm leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-700 mt-2 flex-shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Eligibility Hints */}
          {result.eligibility_hints && result.eligibility_hints.length > 0 && (
            <div className="card p-6 space-y-3 border-slate-200 bg-white">
              <h2 className="text-emerald-900 font-bold text-lg flex items-center gap-2">
                <Users size={18} className="text-emerald-700" />
                {t('policy.sectionEligibility')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.eligibility_hints.map((hint, i) => (
                  <div key={i} className="text-slate-700 text-xs sm:text-sm bg-emerald-50/60 border border-emerald-100 rounded-lg p-3">
                    {hint}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Limitations */}
          <ListSection
            icon={AlertCircle}
            color="text-red-700"
            title={t('policy.sectionLimitations')}
            items={result.limitations}
            notSpecifiedText={t('policy.notSpecified')}
          />

          {/* Missing info disclosure */}
          {result.missing_info && result.missing_info.length > 0 && (
            <div className="card border-slate-200 bg-slate-50/70 p-5 space-y-2">
              <h2 className="text-slate-700 font-bold text-sm flex items-center gap-2">
                <HelpCircle size={16} className="text-slate-500" />
                {t('policy.sectionMissing')}
              </h2>
              <ul className="space-y-1">
                {result.missing_info.map((item, i) => (
                  <li key={i} className="text-slate-500 text-xs italic">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
