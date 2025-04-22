"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/app/contexts/LanguageContext"

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      className="text-gray-600 hover:text-gray-900"
      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
    >
      {language === 'en' ? '中文' : 'EN'}
    </Button>
  );
} 