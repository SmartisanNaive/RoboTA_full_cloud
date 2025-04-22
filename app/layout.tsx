import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Navigation } from "./components/Navigation"
import { FloatingAssistant } from "./components/FloatingAssistant"
import { LanguageProvider } from './contexts/LanguageContext'
import { Footer } from './components/Footer'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <Navigation />
          <main>{children}</main>
          <FloatingAssistant />
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}



import './globals.css'