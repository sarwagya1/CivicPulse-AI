import { useState, useEffect, useRef } from 'react'
import { Mic, Square, AlertCircle, X, Globe, Check } from 'lucide-react'
import { useLanguage } from '../utils/LanguageContext'

/**
 * VoiceDictationButton
 * ====================
 * Multilingual Speech-to-Text component using browser Web Speech API.
 * Supports:
 * - English (en-IN) and Hindi (hi-IN) dictation
 * - Real-time listening indicator & interim speech feedback
 * - Append-to-text without overwriting existing content
 * - Graceful fallback and error states for unsupported browsers or denied permissions
 * - Full keyboard and screen-reader accessibility
 */
export default function VoiceDictationButton({
  onTranscript,
  targetLabel = 'text field',
  className = '',
}) {
  const { lang, t } = useLanguage()

  // Browser Web Speech API support check
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  
  // Default recognition language based on app language ('en' -> 'en-IN', 'hi' -> 'hi-IN')
  const [dictationLang, setDictationLang] = useState(lang === 'hi' ? 'hi-IN' : 'en-IN')

  const recognitionRef = useRef(null)

  // Update default dictation language if UI language changes and not actively recording
  useEffect(() => {
    if (!isListening) {
      setDictationLang(lang === 'hi' ? 'hi-IN' : 'en-IN')
    }
  }, [lang, isListening])

  // Detect Web Speech API support on mount
  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    setIsSupported(Boolean(SpeechRecognition))
  }, [])

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // Ignore abort errors on unmount
        }
      }
    }
  }, [])

  function startListening() {
    setErrorMessage(null)
    setInterimText('')

    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)

    if (!SpeechRecognition) {
      setErrorMessage(t('common.voice.unsupportedDesc'))
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = dictationLang
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        setErrorMessage(null)
      }

      recognition.onresult = (event) => {
        let finalChunk = ''
        let currentInterim = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i]
          const transcript = item[0]?.transcript || ''
          if (item.isFinal) {
            finalChunk += transcript
          } else {
            currentInterim += transcript
          }
        }

        if (finalChunk.trim()) {
          onTranscript(finalChunk.trim())
        }
        setInterimText(currentInterim)
      }

      recognition.onerror = (event) => {
        setIsListening(false)
        setInterimText('')

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage(t('common.voice.deniedDesc'))
        } else if (event.error === 'no-speech') {
          setErrorMessage(t('common.voice.noSpeechDesc'))
        } else if (event.error === 'network') {
          setErrorMessage(t('common.voice.networkDesc'))
        } else {
          setErrorMessage(t('common.voice.genericError'))
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        setInterimText('')
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      setIsListening(false)
      setErrorMessage(t('common.voice.genericError'))
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Handle stop error gracefully
      }
    }
    setIsListening(false)
    setInterimText('')
  }

  function toggleLanguage() {
    const nextLang = dictationLang === 'en-IN' ? 'hi-IN' : 'en-IN'
    setDictationLang(nextLang)
    // If currently listening, restart with new language
    if (isListening) {
      stopListening()
      setTimeout(() => {
        setDictationLang(nextLang)
      }, 100)
    }
  }

  return (
    <div className={`relative inline-flex flex-col items-end gap-1.5 ${className}`}>
      {/* Controls Container */}
      <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-lg p-1 shadow-2xs">
        {/* Language Selection Toggle */}
        <button
          type="button"
          onClick={toggleLanguage}
          disabled={!isSupported}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold border transition-colors focus-visible:ring-2 focus-visible:ring-sky-600 ${
            dictationLang === 'hi-IN'
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-sky-100 text-sky-900 border-sky-300'
          }`}
          title={`${t('common.voice.toggleLanguage')}: ${
            dictationLang === 'hi-IN' ? t('common.voice.langHi') : t('common.voice.langEn')
          }`}
          aria-label={`${t('common.voice.toggleLanguage')}. Currently ${
            dictationLang === 'hi-IN' ? 'Hindi' : 'English'
          }`}
        >
          <Globe size={11} className="text-slate-600" />
          <span>{dictationLang === 'hi-IN' ? t('common.voice.langHiShort') : t('common.voice.langEnShort')}</span>
        </button>

        {/* Microphone / Recording Toggle Button */}
        {!isListening ? (
          <button
            type="button"
            onClick={startListening}
            disabled={!isSupported}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-sky-600"
            title={
              isSupported
                ? `${t('common.voice.start')} (${dictationLang === 'hi-IN' ? 'हिन्दी' : 'English'})`
                : t('common.voice.unsupportedDesc')
            }
            aria-label={`${t('common.voice.start')} for ${targetLabel}`}
          >
            <Mic size={13} className="text-sky-700" />
            <span>{t('common.voice.dictate')}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopListening}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-red-50 text-red-800 border border-red-300 shadow-2xs animate-pulse transition-all focus-visible:ring-2 focus-visible:ring-red-600"
            title={t('common.voice.stop')}
            aria-label={`${t('common.voice.stop')} recording for ${targetLabel}`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <Square size={11} className="text-red-700" fill="currentColor" />
            <span>{t('common.voice.stop')}</span>
          </button>
        )}
      </div>

      {/* Live Active Feedback Banner */}
      {isListening && (
        <div
          role="status"
          aria-live="polite"
          className="w-full text-xs bg-sky-50 border border-sky-200 text-sky-950 rounded-lg p-2 flex flex-col gap-1 shadow-2xs animate-fade-in"
        >
          <div className="flex items-center justify-between font-semibold text-[11px] text-sky-900">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {t('common.voice.listening')} ({dictationLang === 'hi-IN' ? 'हिन्दी' : 'English'})
            </span>
            <span className="text-[10px] text-slate-500">
              {t('common.voice.listeningHint')} {dictationLang === 'hi-IN' ? 'हिन्दी' : 'English'}
            </span>
          </div>
          {interimText && (
            <p className="text-slate-700 italic text-[11px] bg-white/80 p-1.5 rounded border border-sky-100">
              <span className="text-slate-400 not-italic mr-1">{t('common.voice.interimPreview')}</span>
              &ldquo;{interimText}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Accessible Error / Notification Alert */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="w-full text-xs bg-amber-50 border border-amber-300 text-amber-900 rounded-lg p-2.5 flex items-start justify-between gap-2 shadow-2xs"
        >
          <div className="flex items-start gap-1.5 flex-1">
            <AlertCircle size={14} className="text-amber-700 mt-0.5 flex-shrink-0" />
            <span className="text-[11px] leading-relaxed">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-amber-700 hover:text-amber-950 p-0.5 rounded transition-colors"
            title={t('common.voice.dismiss')}
            aria-label={t('common.voice.dismiss')}
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
