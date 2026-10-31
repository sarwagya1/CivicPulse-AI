import { Routes, Route } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './utils/LanguageContext'
import ServiceBanner from './components/ServiceBanner'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import PolicyExplainer from './pages/PolicyExplainer'
import GrievancePortal from './pages/GrievancePortal'
import FactChecker from './pages/FactChecker'
import SchemeFinder from './pages/SchemeFinder'

function AppInner() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <ServiceBanner />
      <Navbar />
      <main id="main-content" tabIndex="-1" className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/policy"     element={<PolicyExplainer />} />
          <Route path="/grievance"  element={<GrievancePortal />} />
          <Route path="/fact-check" element={<FactChecker />} />
          <Route path="/schemes"    element={<SchemeFinder />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  )
}
