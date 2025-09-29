"use client"

import Link from "next/link"
import { FlaskRoundIcon as Flask } from "lucide-react"
import { LanguageSwitch } from "./LanguageSwitch"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translate } from "@/app/utils/translate"

export function Navigation() {
  const { language } = useLanguage()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Flask className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-blue-600">SynbioCloudLab</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink href="/">{translate('home', language)}</NavLink>
              <NavLink href="/experiments">{translate('course', language)}</NavLink>
              <NavLink href="/interactive-learning">{translate('interactiveLearning', language)}</NavLink>
              <NavLink href="/virtual-lab">{translate('virtualLab', language)}</NavLink>
              <NavLink href="/experiment/real-lab-control">{translate('realLab', language)}</NavLink>
              <NavLink href="/resources">{translate('resources', language)}</NavLink>
              <NavLink
                href="https://labs.google.com/code/dsa?view=playground"
                target="_blank"
                rel="noopener noreferrer"
              >
                {translate('dataAnalyze', language)}
              </NavLink>
              <NavLink href="/help">{translate('help', language)}</NavLink>
            </div>
          </div>
          <div className="flex items-center">
            <LanguageSwitch />
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, children, ...props }) {
  return (
    <Link
      href={href}
      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      {...props}
    >
      {children}
    </Link>
  )
}
