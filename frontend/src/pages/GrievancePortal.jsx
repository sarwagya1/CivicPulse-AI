import { useState, useRef } from 'react'
import {
  AlertTriangle,
  Loader2,
  MapPin,
  User,
  Mail,
  Send,
  Search,
  Camera,
  X,
  ExternalLink,
  ShieldAlert,
  Info,
  CheckCircle2,
  Flame,
  AlertCircle,
  FileX,
  Copy,
  Check,
  Building,
  Clock,
  Sparkles,
  PhoneCall
} from 'lucide-react'
import api from '../utils/api'
import { useLanguage } from '../utils/LanguageContext'
import Breadcrumbs from '../components/Breadcrumbs'
import VoiceDictationButton from '../components/VoiceDictationButton'

const SEVERITY_BADGE = {
  CRITICAL: 'badge-critical',
  HIGH:     'badge-high',
  MEDIUM:   'badge-medium',
  LOW:      'badge-low',
}

export default function GrievancePortal() {
  const { t } = useLanguage()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    description: '',
    location: '',
    citizen_name: '',
    citizen_email: '',
  })

  // Image upload states
  const [imagePreview, setImagePreview] = useState('')
  const [imageFileName, setImageFileName] = useState('')
  const [imageError, setImageError] = useState('')

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Geolocation states
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState('')

  // Tracking states
  const [trackToken, setTrackToken] = useState('')
  const [trackResult, setTrackResult] = useState(null)
  const [trackLoading, setTrackLoading] = useState(false)

  // Copy token feedback
  const [copiedToken, setCopiedToken] = useState(false)

  function update(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function applySample(type) {
    if (type === 'pothole') {
      setForm({
        citizen_name: 'Rahul Sharma',
        citizen_email: 'rahul.sharma@example.com',
        location: 'Main MG Road, near Metro Pillar 142, Gurugram',
        description: 'There is a large, deep pothole in the center lane of the road. It has caused multiple two-wheeler skids and severe traffic bottlenecks over the past 48 hours.',
      })
    } else if (type === 'water') {
      setForm({
        citizen_name: 'Anita Verma',
        citizen_email: 'anita.verma@example.com',
        location: 'Sector 4, Pocket B, Vikas Nagar, Lucknow',
        description: 'The underground municipal water supply pipeline has burst. Contaminated sewage water is mixing with drinking water, posing a severe health hazard to local families.',
      })
    } else if (type === 'light') {
      setForm({
        citizen_name: 'Suresh Patel',
        citizen_email: 'suresh.patel@example.com',
        location: 'Gandhi Chowk, Ring Road, Ahmedabad',
        description: 'An overhead transformer cable has snapped and is hanging dangerously low with visible sparks whenever it rains. Immediate electrical isolation is required.',
      })
    }
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageError('')

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type.toLowerCase())) {
      setImageError(t('grievance.imageErrorType'))
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      setImageError(t('grievance.imageErrorSize'))
      return
    }

    setImageFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveImage() {
    setImagePreview('')
    setImageFileName('')
    setImageError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
    if (!emailRegex.test(form.citizen_email.trim())) {
      setError('Please provide a valid email address.')
      setLoading(false)
      return
    }

    const payload = {
      ...form,
      citizen_email: form.citizen_email.trim(),
      image_data: imagePreview || null,
    }

    try {
      const res = await api.post('/grievance/submit', payload)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || t('grievance.errorBackend'))
    } finally {
      setLoading(false)
    }
  }

  async function handleTrack(e) {
    e.preventDefault()
    if (!trackToken.trim()) return
    setTrackLoading(true)
    setTrackResult(null)
    try {
      const res = await api.get(`/grievance/track/${trackToken.trim()}`)
      setTrackResult(res.data)
    } catch {
      setTrackResult({ error: t('grievance.tokenNotFound') })
    } finally {
      setTrackLoading(false)
    }
  }

  async function detectLocation() {
    if (!navigator.geolocation) {
      setLocError(t('grievance.locationUnavailable'))
      return
    }
    setLocLoading(true)
    setLocError('')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'CivicPulseAI/1.0 (civicpulse-grievance; NITroFORGE hackathon)',
                'Accept-Language': 'en',
              },
            }
          )
          if (!res.ok) throw new Error('Geocoding API error')
          const data = await res.json()
          const addr = data.address || {}
          const parts = [
            addr.neighbourhood || addr.suburb || addr.village,
            addr.city_district || addr.county,
            addr.city || addr.town || addr.state_district,
            addr.state,
          ].filter(Boolean)
          const location = parts.length > 0
            ? parts.join(', ')
            : (data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          setForm(f => ({ ...f, location }))
        } catch {
          const { latitude, longitude } = pos.coords
          setForm(f => ({ ...f, location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }))
        } finally {
          setLocLoading(false)
        }
      },
      (err) => {
        if (err.code === 1) {
          setLocError(t('grievance.locationDenied'))
        } else {
          setLocError(t('grievance.locationUnavailable'))
        }
        setLocLoading(false)
      },
      { timeout: 12000, enableHighAccuracy: false }
    )
  }

  function copyTrackingToken(token) {
    if (!token) return
    navigator.clipboard.writeText(token)
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2500)
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs currentTitle={t('grievance.title')} serviceBadge="Smart Public Grievance Routing" />

      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-800 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
          <AlertTriangle size={13} />
          <span>Civic Resolution &amp; Escalation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('grievance.title')}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          {t('grievance.subtitle')}
        </p>
      </div>

      {/* Quick Test Samples */}
      <div className="card bg-slate-50 border-slate-200/80 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            Quick Example Issues (1-Click Fill)
          </span>
          <span className="text-[11px] text-slate-500">Test department routing</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applySample('pothole')}
            className="btn-subtle hover:bg-orange-50 hover:text-orange-900 border border-slate-200"
          >
            🚧 {t('grievance.samplePothole')}
          </button>
          <button
            type="button"
            onClick={() => applySample('water')}
            className="btn-subtle hover:bg-orange-50 hover:text-orange-900 border border-slate-200"
          >
            💧 {t('grievance.sampleWater')}
          </button>
          <button
            type="button"
            onClick={() => applySample('light')}
            className="btn-subtle hover:bg-orange-50 hover:text-orange-900 border border-slate-200"
          >
            ⚡ {t('grievance.sampleLight')}
          </button>
        </div>
      </div>

      {/* Main Submission Form (GOV.UK Fieldset Standards) */}
      <form onSubmit={handleSubmit} className="card space-y-8 border-slate-200 shadow-sm">
        {/* Step 1: Citizen Contact */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <div className="w-6 h-6 rounded-full bg-sky-700 text-white text-xs font-bold flex items-center justify-center">
              1
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {t('grievance.step1')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="form-label flex items-center gap-1.5">
                <User size={14} className="text-slate-500" />
                {t('grievance.nameLabel')}
              </span>
              <input
                className="input-field"
                placeholder={t('grievance.namePlaceholder')}
                value={form.citizen_name}
                onChange={update('citizen_name')}
              />
              <span className="form-hint">You may use an alias or leave blank for Anonymous.</span>
            </label>

            <label className="block">
              <span className="form-label flex items-center gap-1.5">
                <Mail size={14} className="text-sky-700" />
                {t('grievance.emailLabel')}
              </span>
              <input
                type="email"
                className="input-field"
                placeholder={t('grievance.emailPlaceholder')}
                value={form.citizen_email}
                onChange={update('citizen_email')}
                required
              />
              <span className="form-hint">{t('grievance.emailHint')}</span>
            </label>
          </div>
        </div>

        {/* Step 2: Location */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <div className="w-6 h-6 rounded-full bg-sky-700 text-white text-xs font-bold flex items-center justify-center">
              2
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {t('grievance.step2')}
            </h2>
          </div>

          <div className="block">
            <div className="flex items-center justify-between mb-1.5">
              <span className="form-label mb-0 flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-500" />
                {t('grievance.locationLabel')}
              </span>
              <VoiceDictationButton
                onTranscript={(spoken) => {
                  setForm((prev) => ({
                    ...prev,
                    location: prev.location ? `${prev.location.trim()} ${spoken}` : spoken,
                  }))
                }}
                targetLabel={t('grievance.locationLabel')}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-start">
              <input
                className="input-field flex-1"
                placeholder={t('grievance.locationPlaceholder')}
                value={form.location}
                onChange={update('location')}
                required
              />
              <button
                type="button"
                onClick={detectLocation}
                disabled={locLoading}
                className="btn-secondary whitespace-nowrap flex-shrink-0 text-xs py-2.5"
                title={t('grievance.useMyLocation')}
              >
                {locLoading ? <Loader2 size={14} className="animate-spin text-sky-700" /> : <MapPin size={14} className="text-sky-700" />}
                <span>{locLoading ? t('grievance.detectingLocation') : t('grievance.useMyLocation')}</span>
              </button>
            </div>
            <span className="form-hint">{t('grievance.locationHint')}</span>
            {locError && (
              <p className="text-red-600 text-xs mt-1 font-medium">{locError}</p>
            )}
          </div>
        </div>

        {/* Step 3: Issue Description */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <div className="w-6 h-6 rounded-full bg-sky-700 text-white text-xs font-bold flex items-center justify-center">
              3
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {t('grievance.step3')}
            </h2>
          </div>

          <label className="block">
            <div className="flex items-center justify-between mb-1.5">
              <span className="form-label mb-0">
                {t('grievance.issueLabel')}
              </span>
              <VoiceDictationButton
                onTranscript={(spoken) => {
                  setForm((prev) => ({
                    ...prev,
                    description: prev.description ? `${prev.description.trim()} ${spoken}` : spoken,
                  }))
                }}
                targetLabel={t('grievance.issueLabel')}
              />
            </div>
            <textarea
              className="input-field h-36 resize-y"
              placeholder={t('grievance.issuePlaceholder')}
              value={form.description}
              onChange={update('description')}
              required
            />
            <span className="form-hint">{t('grievance.issueHint')}</span>
          </label>
        </div>

        {/* Step 4: Visual Photographic Evidence */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <div className="w-6 h-6 rounded-full bg-sky-700 text-white text-xs font-bold flex items-center justify-center">
              4
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {t('grievance.step4')}
            </h2>
          </div>

          <div className="block">
            <span className="form-label flex items-center gap-1.5">
              <Camera size={14} className="text-sky-700" />
              {t('grievance.imageLabel')}
            </span>

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-6 text-center cursor-pointer transition-all duration-150 bg-slate-50 hover:bg-sky-50/40 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Camera size={28} className="mx-auto text-slate-400 group-hover:text-sky-700 transition-colors mb-2" />
                <p className="text-sm text-slate-800 font-semibold">{t('grievance.imageUploadHint')}</p>
                <p className="text-xs text-slate-500 mt-1">{t('grievance.imageFormats')}</p>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <img
                  src={imagePreview}
                  alt="Damage preview"
                  className="w-16 h-16 object-cover rounded-lg border border-slate-300 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{imageFileName}</p>
                  <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={13} /> Ready for AI visual validation &amp; assessment
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-slate-500 hover:text-red-700 p-2 rounded-lg hover:bg-slate-200 transition-colors"
                  title={t('grievance.imageRemove')}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {imageError && (
              <p className="text-red-600 text-xs mt-1.5 font-medium">{imageError}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            🔒 Dispatched via encrypted connection. Confirmation token sent via email.
          </span>
          <button
            type="submit"
            className="btn-primary w-full sm:w-auto px-8 py-3 text-base"
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span>{loading ? t('grievance.submitting') : t('grievance.submit')}</span>
          </button>
        </div>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold">Submission Error: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Main Success & Token Registration Card */}
          <div className="card border-slate-200 p-6 space-y-6 bg-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  SLA Registration Complete
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {t('grievance.resultTitle')}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Assigned Severity:</span>
                <span className={SEVERITY_BADGE[result.severity.level]}>
                  {result.severity.level}
                </span>
              </div>
            </div>

            {/* Quick Token & ID Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-slate-500 text-xs font-medium mb-1">{t('grievance.grievanceId')}</div>
                <div className="text-slate-900 font-mono font-bold text-base truncate">{result.grievance_id}</div>
              </div>

              <div className="bg-sky-50 rounded-xl p-4 border border-sky-200 relative">
                <div className="text-sky-800 text-xs font-medium mb-1">{t('grievance.trackingToken')}</div>
                <div className="text-sky-950 font-mono font-bold text-base">{result.tracking_token}</div>
                <button
                  type="button"
                  onClick={() => copyTrackingToken(result.tracking_token)}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-sky-700 hover:text-sky-900 font-semibold"
                >
                  {copiedToken ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copiedToken ? t('common.copied') : t('common.copy')}</span>
                </button>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-slate-500 text-xs font-medium mb-1">{t('grievance.routedTo')}</div>
                <div className="text-slate-900 font-semibold text-sm">{result.department}</div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-slate-500 text-xs font-medium mb-1">{t('grievance.expectedResolution')}</div>
                <div className="text-slate-900 font-semibold text-sm">{result.estimated_resolution}</div>
              </div>
            </div>

            {/* SLA & Urgency Meter */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <span>
                    <strong className="text-slate-700">{t('grievance.sla')} </strong>
                    <span className="text-slate-900 font-bold">{result.severity.sla_hours} {t('grievance.slaHours')}</span>
                  </span>
                  <span>
                    <strong className="text-slate-700">{t('grievance.urgencyScore')} </strong>
                    <span className="text-slate-900 font-bold">{(result.urgency_score * 100).toFixed(1)}%</span>
                  </span>
                </div>
              </div>

              {result.severity.basis && (
                <p className="text-slate-600 pt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-700">{t('grievance.combinedSeverityBasis')} </span>
                  {result.severity.basis}
                </p>
              )}
            </div>

            {/* Email Confirmation Notice */}
            {result.email_status_message && (
              <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                result.email_confirmation_sent
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-slate-100 border border-slate-200 text-slate-800'
              }`}>
                <Mail size={16} className={result.email_confirmation_sent ? 'text-emerald-700 flex-shrink-0' : 'text-slate-500 flex-shrink-0'} />
                <span className="font-medium">{result.email_status_message}</span>
              </div>
            )}
          </div>

          {/* AI Image Validation & Damage Assessment Card */}
          {result.image_analysis && result.image_analysis.has_image && (
            <>
              {!result.image_analysis.is_relevant ? (
                <div className="card border-amber-300 bg-amber-50/70 p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-amber-900 font-bold text-sm flex items-center gap-2">
                      <FileX size={16} className="text-amber-700" />
                      {t('grievance.imageRelevanceTitle')}
                    </h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 border border-amber-300">
                      {result.image_analysis.status}
                    </span>
                  </div>
                  <p className="text-amber-900 text-sm font-medium">
                    {result.image_analysis.message}
                  </p>
                  <p className="text-slate-600 text-xs italic">
                    Note: No visual damage assessment or severity escalation was applied for this photograph.
                  </p>
                </div>
              ) : (
                <div className="card border-sky-200 bg-sky-50/40 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sky-900 font-bold text-base flex items-center gap-2">
                      <Camera size={18} className="text-sky-700" />
                      {t('grievance.visualAiTitle')}
                    </h3>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-300">
                      {result.image_analysis.engine || 'Vision Model'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="sm:col-span-2 bg-white rounded-lg p-3.5 border border-slate-200">
                      <div className="text-slate-500 text-xs font-medium mb-1">{t('grievance.visibleDamage')}</div>
                      <div className="text-slate-900 font-medium">{result.image_analysis.visible_damage}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3.5 border border-slate-200 flex flex-col justify-center">
                      <div className="text-slate-500 text-xs font-medium mb-1">{t('grievance.apparentSeverity')}</div>
                      <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                        <Flame size={16} className={result.image_analysis.apparent_severity === 'HIGH' ? 'text-red-600' : 'text-amber-600'} />
                        <span>{result.image_analysis.apparent_severity}</span>
                      </div>
                    </div>
                  </div>

                  {result.image_analysis.safety_risks && result.image_analysis.safety_risks.length > 0 && (
                    <div className="bg-white rounded-lg p-3.5 border border-slate-200 text-sm">
                      <div className="text-amber-800 text-xs font-bold mb-1.5 flex items-center gap-1">
                        <AlertCircle size={14} /> {t('grievance.safetyRisks')}
                      </div>
                      <ul className="space-y-1">
                        {result.image_analysis.safety_risks.map((risk, idx) => (
                          <li key={idx} className="text-slate-700 text-xs flex items-start gap-1.5">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.image_analysis.ai_reasoning && (
                    <div className="bg-white rounded-lg p-3.5 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      <span className="text-sky-900 font-bold">{t('grievance.aiReasoning')}: </span>
                      {result.image_analysis.ai_reasoning}
                    </div>
                  )}

                  <p className="text-slate-500 text-[11px] italic">
                    * {t('grievance.visualDisclaimer')}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Official Government Grievance Escalation Card */}
          <div className="card border-emerald-300 bg-gradient-to-r from-emerald-50/60 to-teal-50/60 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-emerald-950 font-bold text-base flex items-center gap-2">
                <ShieldAlert size={18} className="text-emerald-700" />
                {t('grievance.officialPortalTitle')}
              </h3>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Government of India
              </span>
            </div>

            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
              {t('grievance.officialNotice')}
            </p>

            <div className="bg-white rounded-xl p-5 border border-emerald-200/80 space-y-4">
              <div>
                <span className="text-slate-500 text-xs block mb-1 font-medium">Competent Authority Portal:</span>
                <span className="text-slate-900 font-bold text-base block">{result.official_portal?.portal_name}</span>
              </div>

              {/* Direct CTA */}
              {result.official_portal?.is_available && result.official_portal?.portal_url ? (
                <div>
                  <a
                    href={result.official_portal.portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center gap-2 text-sm px-5 py-2.5 font-bold"
                  >
                    {t('grievance.fileOnPortal')} <ExternalLink size={14} />
                  </a>
                </div>
              ) : (
                <div className="text-amber-800 text-xs italic font-medium">
                  {t('grievance.portalUnavailable')}
                </div>
              )}

              {/* Helpline & Escalation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs">
                {result.official_portal?.helpline && (
                  <div>
                    <span className="text-slate-500 block mb-0.5 font-medium">{t('grievance.helpline')}:</span>
                    <span className="text-sky-800 font-bold text-sm flex items-center gap-1">
                      <PhoneCall size={13} className="text-sky-700" />
                      {result.official_portal.helpline}
                    </span>
                  </div>
                )}
                {result.official_portal?.national_portal_url && (
                  <div>
                    <span className="text-slate-500 block mb-0.5 font-medium">{t('grievance.nationalPortal')}:</span>
                    <a
                      href={result.official_portal.national_portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline font-bold inline-flex items-center gap-1 text-sm"
                    >
                      {result.official_portal.national_portal} <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {result.official_portal?.action_guide && (
                <div className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <strong className="text-slate-800">{t('grievance.actionGuide')}: </strong>
                  {result.official_portal.action_guide}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Track Existing Grievance Card */}
      <div className="card space-y-4 border-slate-200 bg-white">
        <div>
          <h2 className="text-slate-900 font-bold text-lg flex items-center gap-2">
            <Search size={18} className="text-sky-700" />
            {t('grievance.trackTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('grievance.trackSubtitle')}
          </p>
        </div>

        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
          <input
            className="input-field flex-1"
            placeholder={t('grievance.trackPlaceholder')}
            value={trackToken}
            onChange={e => setTrackToken(e.target.value)}
          />
          <button
            type="submit"
            className="btn-secondary whitespace-nowrap"
            disabled={trackLoading}
          >
            {trackLoading ? <Loader2 size={16} className="animate-spin text-sky-700" /> : <Search size={16} />}
            <span>{trackLoading ? t('grievance.tracking') : t('grievance.track')}</span>
          </button>
        </form>

        {trackResult && (
          <div className={`p-4 rounded-xl text-sm ${
            trackResult.error
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
          }`}>
            <p className="font-semibold">
              {trackResult.error || `${t('grievance.trackStatus')} ${trackResult.status} — ${trackResult.message}`}
            </p>
            {trackResult.escalation_portal && (
              <div className="mt-2 text-xs text-slate-600 border-t border-emerald-200/80 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>{trackResult.escalation_note}</span>
                <a
                  href={trackResult.escalation_portal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-800 font-bold hover:underline inline-flex items-center gap-1"
                >
                  CPGRAMS Portal <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
