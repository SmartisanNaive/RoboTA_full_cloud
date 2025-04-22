"use client"

import { useLanguage } from "@/app/contexts/LanguageContext"
import { translate } from "@/app/utils/translate"

export function Footer() {
  const { language } = useLanguage()
  
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500 text-sm">{translate('copyright', language)}</p>
        <p className="text-center text-gray-500 text-sm mt-2">{translate('contact', language)}</p>
      </div>
    </footer>
  )
} 