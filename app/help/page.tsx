"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mail, AlertTriangle, HelpCircle, BookOpen, FileQuestion, Shield } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translate } from "@/app/utils/translate"

export default function HelpPage() {
  const { language } = useLanguage()
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-blue-600 text-white p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{translate('helpTitle', language)}</h1>
          <p className="text-blue-100 text-lg">{translate('helpSubtitle', language)}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-8">
        <Card className="shadow-lg border-blue-100">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-700">{translate('needAssistance', language)}</CardTitle>
            <CardDescription>{translate('assistanceDesc', language)}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-700">
              {translate('assistanceText', language)}
            </p>
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
              <Mail className="h-6 w-6 text-blue-600" />
              <p className="text-lg font-semibold">{translate('contactUs', language)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-blue-100">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-700">{translate('faqTitle', language)}</CardTitle>
            <CardDescription>{translate('faqDesc', language)}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium">{translate('faq1Title', language)}</AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  {translate('faq1Content', language)}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-medium">{translate('faq2Title', language)}</AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  {translate('faq2Content', language)}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-medium">{translate('faq3Title', language)}</AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  {translate('faq3Content', language)}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-medium">{translate('faq4Title', language)}</AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  {translate('faq4Content', language)}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-medium">{translate('faq5Title', language)}</AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  {translate('faq5Content', language)}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-amber-100 bg-amber-50">
          <CardHeader className="border-b border-amber-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <CardTitle className="text-2xl font-bold text-amber-800">{translate('disclaimersTitle', language)}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6 text-amber-900">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5" /> {translate('educationalTitle', language)}
                </h3>
                <p>
                  {translate('educationalContent', language)}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> {translate('safetyTitle', language)}
                </h3>
                <p>
                  {translate('safetyContent', language)}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <FileQuestion className="h-5 w-5" /> {translate('dataAccuracyTitle', language)}
                </h3>
                <p>
                  {translate('dataAccuracyContent', language)}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> {translate('ethicalTitle', language)}
                </h3>
                <p>
                  {translate('ethicalContent', language)}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" /> {translate('learningLimitationsTitle', language)}
                </h3>
                <p>
                  {translate('learningLimitationsContent', language)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <footer className="bg-gray-100 py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-600">
        </div>
      </footer>
    </div>
  )
}

