import { useState, useMemo } from 'react'
import {
  BookOpen,
  Loader2,
  ExternalLink,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  User,
  GraduationCap,
  MapPin,
  Sparkles,
  RefreshCw,
  Building2
} from 'lucide-react'
import api from '../utils/api'
import { useLanguage } from '../utils/LanguageContext'
import Breadcrumbs from '../components/Breadcrumbs'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Puducherry',
]

export default function SchemeFinder() {
  const { t } = useLanguage()

  const [profile, setProfile] = useState({
    age: 22,
    gender: 'male',
    state: 'Uttar Pradesh',
    category: 'general',
    annual_income: 200000,
    occupation: 'student',
    education: 'graduate',
    disability: false,
    bpl: false,
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')

  function update(field, val) {
    setProfile(p => ({ ...p, [field]: val }))
  }

  // Preset profiles for rapid testing & user convenience (Canada Benefits Finder pattern)
  function applyPreset(presetType) {
    if (presetType === 'student') {
      setProfile({
        age: 20,
        gender: 'male',
        state: 'Uttar Pradesh',
        category: 'general',
        annual_income: 220000,
        occupation: 'student',
        education: 'graduate',
        disability: false,
        bpl: false,
      })
    } else if (presetType === 'farmer') {
      setProfile({
        age: 42,
        gender: 'male',
        state: 'Punjab',
        category: 'obc',
        annual_income: 180000,
        occupation: 'farmer',
        education: '10th',
        disability: false,
        bpl: true,
      })
    } else if (presetType === 'selfEmployed') {
      setProfile({
        age: 32,
        gender: 'female',
        state: 'Bihar',
        category: 'sc',
        annual_income: 120000,
        occupation: 'self-employed',
        education: '12th',
        disability: false,
        bpl: true,
      })
    } else if (presetType === 'senior') {
      setProfile({
        age: 65,
        gender: 'female',
        state: 'Delhi',
        category: 'general',
        annual_income: 150000,
        occupation: 'unemployed',
        education: 'graduate',
        disability: true,
        bpl: false,
      })
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    setSearchTerm('')
    setActiveFilter('ALL')

    try {
      const res = await api.post('/scheme/find', profile)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || t('schemes.errorBackend'))
    } finally {
      setLoading(false)
    }
  }

  // In-page search and category filter for returned schemes
  const filteredSchemes = useMemo(() => {
    if (!result?.schemes) return []
    return result.schemes.filter(scheme => {
      const matchesSearch = searchTerm.trim() === '' ||
        scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.ministry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.benefit.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      if (activeFilter === 'ALL') return true
      if (activeFilter === 'EDUCATION') {
        return scheme.name.toLowerCase().includes('scholarship') ||
               scheme.name.toLowerCase().includes('student') ||
               scheme.description.toLowerCase().includes('education')
      }
      if (activeFilter === 'FARMER') {
        return scheme.name.toLowerCase().includes('kisan') ||
               scheme.name.toLowerCase().includes('krishi') ||
               scheme.description.toLowerCase().includes('farmer')
      }
      if (activeFilter === 'FINANCIAL') {
        return scheme.benefit.includes('₹') ||
               scheme.benefit.toLowerCase().includes('dbt') ||
               scheme.benefit.toLowerCase().includes('assistance')
      }
      return true
    })
  }, [result, searchTerm, activeFilter])

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs currentTitle={t('schemes.title')} serviceBadge="myScheme.gov.in Integration" />

      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <BookOpen size={13} />
          <span>Government Welfare Discovery</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('schemes.title')}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          {t('schemes.subtitle')}{' '}
          <a
            href="https://www.myscheme.gov.in"
            target="_blank"
            rel="noreferrer"
            className="text-sky-700 font-semibold inline-flex items-center gap-1 hover:underline ml-1"
          >
            myscheme.gov.in <ExternalLink size={13} />
          </a>
        </p>
      </div>

      {/* Preset Personas (Canada Benefits Finder pattern) */}
      <div className="card bg-slate-50 border-slate-200/80 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            Quick Presets (1-Click Fill)
          </span>
          <span className="text-[11px] text-slate-500">Fast profile testing</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset('student')}
            className="btn-subtle hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200"
          >
            🎓 {t('schemes.presetStudent')}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('farmer')}
            className="btn-subtle hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200"
          >
            🌾 {t('schemes.presetFarmer')}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('selfEmployed')}
            className="btn-subtle hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200"
          >
            💼 {t('schemes.presetSelfEmployed')}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('senior')}
            className="btn-subtle hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200"
          >
            👵 {t('schemes.presetSenior')}
          </button>
        </div>
      </div>

      {/* Step-by-Step Profile Form (myScheme / Canada Benefits Finder) */}
      <form onSubmit={handleSubmit} className="card space-y-8 border-slate-200 shadow-sm">
        {/* Section 1: Personal Background */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <div className="w-6 h-6 rounded-full bg-sky-700 text-white text-xs font-bold flex items-center justify-center">
              1
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {t('schemes.step1Title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <label className="block">
              <span className="form-label">{t('schemes.ageLabel')}</span>
              <input
                type="number"
                min="1"
                max="100"
                className="input-field"
                value={profile.age}
                onChange={e => update('age', parseInt(e.target.value) || 0)}
                required
              />
              <span className="form-hint">E.g. 18 to 65</span>
            </label>

            <label className="block">
              <span className="form-label">{t('schemes.genderLabel')}</span>
              <select
                className="input-field"
                value={profile.gender}
                onChange={e => update('gender', e.target.value)}
              >
                <option value="male">{t('schemes.gender.male')}</option>
                <option value="female">{t('schemes.gender.female')}</option>
                <option value="other">{t('schemes.gender.other')}</option>
              </select>
            </label>

            <label className="block">
              <span className="form-label">{t('schemes.categoryLabel')}</span>
              <select
                className="input-field"
                value={profile.category}
                onChange={e => update('category', e.target.value)}
              >
                <option value="general">{t('schemes.category.general')}</option>
                <option value="obc">{t('schemes.category.obc')}</option>
                <option value="sc">{t('schemes.category.sc')}</option>
                <option value="st">{t('schemes.category.st')}</option>
                <option value="ews">{t('schemes.category.ews')}</option>
              </select>
            </label>
          </div>
        </div>

        {/* Section 2: Education & Household Income */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <div className="w-6 h-6 rounded-full bg-sky-700 text-white text-xs font-bold flex items-center justify-center">
              2
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {t('schemes.step2Title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <label className="block">
              <span className="form-label">{t('schemes.occupationLabel')}</span>
              <select
                className="input-field"
                value={profile.occupation}
                onChange={e => update('occupation', e.target.value)}
              >
                <option value="student">{t('schemes.occupation.student')}</option>
                <option value="farmer">{t('schemes.occupation.farmer')}</option>
                <option value="self-employed">{t('schemes.occupation.selfEmployed')}</option>
                <option value="unemployed">{t('schemes.occupation.unemployed')}</option>
                <option value="salaried">{t('schemes.occupation.salaried')}</option>
                <option value="other">{t('schemes.occupation.other')}</option>
              </select>
            </label>

            <label className="block">
              <span className="form-label">{t('schemes.educationLabel')}</span>
              <select
                className="input-field"
                value={profile.education}
                onChange={e => update('education', e.target.value)}
              >
                <option value="none">{t('schemes.education.none')}</option>
                <option value="10th">{t('schemes.education.tenth')}</option>
                <option value="12th">{t('schemes.education.twelfth')}</option>
                <option value="graduate">{t('schemes.education.graduate')}</option>
                <option value="postgraduate">{t('schemes.education.postgraduate')}</option>
              </select>
            </label>

            <label className="block">
              <span className="form-label">{t('schemes.incomeLabel')}</span>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  className="input-field pl-7"
                  value={profile.annual_income}
                  onChange={e => update('annual_income', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <span className="form-hint">E.g. 2,50,000</span>
            </label>
          </div>
        </div>

        {/* Section 3: State & Special Welfare Criteria */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <div className="w-6 h-6 rounded-full bg-sky-700 text-white text-xs font-bold flex items-center justify-center">
              3
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {t('schemes.step3Title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="form-label">{t('schemes.stateLabel')}</span>
              <select
                className="input-field"
                value={profile.state}
                onChange={e => update('state', e.target.value)}
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <div className="flex flex-col justify-center space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={profile.disability}
                  onChange={e => update('disability', e.target.checked)}
                  className="w-4 h-4 rounded text-sky-700 focus:ring-sky-600 border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                  {t('schemes.disabilityLabel')}
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={profile.bpl}
                  onChange={e => update('bpl', e.target.checked)}
                  className="w-4 h-4 rounded text-sky-700 focus:ring-sky-600 border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                  {t('schemes.bplLabel')}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Submission Action */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            ⚡ Matched directly against live government rules &amp; income slabs.
          </span>
          <button
            type="submit"
            className="btn-primary w-full sm:w-auto px-8 py-3 text-base"
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <BookOpen size={18} />}
            <span>{loading ? t('schemes.submitting') : t('schemes.submit')}</span>
          </button>
        </div>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold">Error finding schemes: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Profile Summary Card (Canada Benefits Finder style) */}
          <div className="card bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-emerald-200/80 p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-emerald-900 font-bold text-lg flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-700" />
                {t('schemes.profileSummary')}
              </h2>
              <span className="bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {t('schemes.found')} {result.total_found} {t('schemes.foundSchemes')}
              </span>
            </div>
            <p className="text-slate-700 text-sm font-medium">
              {result.profile_summary}
            </p>
          </div>

          {/* In-page Filter & Search Controls */}
          {result.schemes.length > 0 && (
            <div className="card p-4 space-y-3 bg-white border-slate-200">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    className="input-field pl-9 py-2 text-xs"
                    placeholder={t('schemes.searchPlaceholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('ALL')}
                    className={`btn-subtle text-xs py-1 px-2.5 ${
                      activeFilter === 'ALL'
                        ? 'bg-sky-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t('schemes.allCategories')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('EDUCATION')}
                    className={`btn-subtle text-xs py-1 px-2.5 ${
                      activeFilter === 'EDUCATION'
                        ? 'bg-sky-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🎓 Education &amp; Scholarships
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('FARMER')}
                    className={`btn-subtle text-xs py-1 px-2.5 ${
                      activeFilter === 'FARMER'
                        ? 'bg-sky-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🌾 Agriculture &amp; Kisan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('FINANCIAL')}
                    className={`btn-subtle text-xs py-1 px-2.5 ${
                      activeFilter === 'FINANCIAL'
                        ? 'bg-sky-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    💰 Financial Assistance
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scheme Cards (myScheme Design Pattern) */}
          {result.schemes.length === 0 ? (
            <div className="card text-center py-10 space-y-3">
              <p className="text-slate-600 text-sm">
                {t('schemes.noSchemes')}
              </p>
              <a
                href="https://www.myscheme.gov.in"
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                {t('schemes.visitMyScheme')}
              </a>
            </div>
          ) : filteredSchemes.length === 0 ? (
            <div className="card text-center py-8 text-slate-500 text-sm">
              No schemes match the search filter &ldquo;{searchTerm}&rdquo;. Try another keyword or clear filter.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchemes.map((scheme, i) => (
                <article
                  key={i}
                  className="card border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 p-6 space-y-4 bg-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <Building2 size={12} className="text-slate-400" />
                          {scheme.ministry}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {scheme.name}
                      </h3>
                    </div>

                    {/* Official Verified Portal CTAs */}
                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0 pt-1 sm:pt-0">
                      {/* Direct Verified Official Government Portal */}
                      {(scheme.official_portal_url || (scheme.url && !scheme.url.includes('myscheme.gov.in'))) ? (
                        <a
                          href={scheme.official_portal_url || scheme.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                          title={t('schemes.officialPortal')}
                        >
                          <ShieldCheck size={14} />
                          <span>{t('schemes.officialPortal')}</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : null}

                      {/* Official MyScheme Page Link */}
                      {scheme.myscheme_url && (
                        <a
                          href={scheme.myscheme_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                          title={t('schemes.mySchemePage')}
                        >
                          <span>{t('schemes.mySchemePage')}</span>
                          <ExternalLink size={11} className="text-slate-500" />
                        </a>
                      )}

                      {/* Fallback indicator */}
                      {(!scheme.official_portal_url && !scheme.myscheme_url && (!scheme.url || scheme.url === 'https://www.myscheme.gov.in/schemes/')) && (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-xs italic">
                          <AlertCircle size={13} />
                          {t('schemes.portalUnavailable')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {scheme.description}
                  </p>

                  {/* Benefit & Eligibility highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-emerald-800 uppercase tracking-wide text-[11px]">
                        <IndianRupee size={12} /> {t('schemes.benefit')}
                      </span>
                      <p className="font-medium text-emerald-900 leading-relaxed">
                        {scheme.benefit}
                      </p>
                    </div>

                    {scheme.eligibility && (
                      <div className="p-3 rounded-lg bg-sky-50/80 border border-sky-200/80 text-sky-950 space-y-1">
                        <span className="font-bold flex items-center gap-1 text-sky-800 uppercase tracking-wide text-[11px]">
                          <CheckCircle2 size={12} /> {t('schemes.eligibilityLabel')}
                        </span>
                        <p className="text-sky-900 leading-relaxed">
                          {scheme.eligibility}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
