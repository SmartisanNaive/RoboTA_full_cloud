"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Microscope, FlaskRound, Dna, ChevronRight, Beaker, Brain, Users } from "lucide-react"
import { motion } from "framer-motion"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translate } from "@/app/utils/translate"

const FeatureCard = ({ titleKey, descriptionKey, icon: Icon, link, buttonTextKey }) => {
  const { language } = useLanguage()
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col h-full border border-blue-100"
    >
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 rounded-full p-3 mr-4">
            <Icon className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{translate(titleKey, language)}</h3>
        </div>
        <p className="text-gray-600 mb-6 flex-grow">{translate(descriptionKey, language)}</p>
        <Link href={link} className="mt-auto">
          <Button variant="outline" className="w-full group h-12 rounded-full border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300">
            {translate(buttonTextKey, language)}
            <ChevronRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const { language } = useLanguage()
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-blue-600 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-700 opacity-50 transform -skew-y-6"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('/images/dna-pattern.png')", backgroundSize: "cover" }}></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto text-center relative z-10 px-4"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">{translate('welcomeTitle', language)}</h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
            {translate('welcomeSubtitle', language)}
          </p>
          <Link href="/experiments">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg"
            >
              {translate('getStarted', language)} <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </motion.div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          <FeatureCard
            titleKey="virtualExperiments"
            descriptionKey="virtualExperimentsDesc"
            icon={Microscope}
            link="/virtual-lab"
            buttonTextKey="exploreExperiments"
          />
          <FeatureCard
            titleKey="realLabControl"
            descriptionKey="realLabControlDesc"
            icon={FlaskRound}
            link="/experiment/real-lab-control"
            buttonTextKey="accessLabControl"
          />
          <FeatureCard
            titleKey="learningResources"
            descriptionKey="learningResourcesDesc"
            icon={Dna}
            link="/resources"
            buttonTextKey="browseResources"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-blue-800">{translate('aboutTitle', language)}</CardTitle>
              <CardDescription className="text-xl text-blue-600">
                {translate('aboutSubtitle', language)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-lg text-gray-700 leading-relaxed">
                {translate('aboutDescription', language)}
              </p>
              <h3 className="text-xl font-semibold mb-4 text-blue-700">{translate('keyFeatures', language)}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                  {
                    icon: Beaker,
                    textKey: 'feature1',
                  },
                  { icon: Users, textKey: 'feature2' },
                  { icon: FlaskRound, textKey: 'feature3' },
                  { icon: Brain, textKey: 'feature4' },
                  { icon: Dna, textKey: 'feature5' },
                ].map((feature, index) => (
                  <div key={index} className="flex items-start bg-blue-50 p-4 rounded-lg">
                    <feature.icon className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-800">{translate(feature.textKey, language)}</span>
                  </div>
                ))}
              </div>
              <p className="text-lg text-blue-800 font-semibold">
                {translate('joinUs', language)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

