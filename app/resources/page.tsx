"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Youtube, BookOpen, GraduationCap } from "lucide-react"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { translate } from "@/app/utils/translate"

export default function LearningResources() {
  const { language } = useLanguage()
  
  const videoResources = [
    {
      title: translate('videoResource1Title', language),
      description: translate('videoResource1Desc', language),
      link: "https://www.youtube.com/watch?v=g_FQdmP5d5Q",
    },
    {
      title: translate('videoResource2Title', language),
      description: translate('videoResource2Desc', language),
      link: "https://www.youtube.com/watch?v=6tw_JVz_IEc",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-8 drop-shadow-sm">
          {translate('resourcesTitle', language)}
        </h1>

        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          {translate('resourcesSubtitle', language)}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <ResourceCard
            titleKey="videoTutorials"
            descriptionKey="videoTutorialsDesc"
            icon={<Youtube className="h-8 w-8 text-red-600" />}
            link="https://www.youtube.com/playlist?list=PLf4eUKhxEIurJDYujUhSWT26-H7gGt7Qq"
            color="red"
          />
          <ResourceCard
            titleKey="ebrcResources"
            descriptionKey="ebrcResourcesDesc"
            icon={<GraduationCap className="h-8 w-8 text-blue-600" />}
            link="https://ebrc.org/focus-areas/education/"
            color="blue"
          />
          <ResourceCard
            titleKey="scientificLiterature"
            descriptionKey="scientificLiteratureDesc"
            icon={<BookOpen className="h-8 w-8 text-green-600" />}
            link="https://www.biorxiv.org/"
            color="green"
          />
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8 mb-12 transform transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">{translate('featuredVideo', language)}</h2>
          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/FMfNBMtxguI"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-[500px]"
            ></iframe>
          </div>
        </div>

        <div id="video-resources" className="mb-12">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">{translate('additionalVideoResources', language)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videoResources.map((resource, index) => (
              <VideoResourceCard key={index} {...resource} />
            ))}
          </div>
        </div>

        <div className="prose max-w-none">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">{translate('aboutSynbioEducation', language)}</h2>
          <p>
            {translate('synbioEducationText1', language)}
          </p>
          <p>
            {translate('synbioEducationText2', language)}
          </p>
          <p>
            {translate('synbioEducationText3', language)}
          </p>
        </div>
      </div>
    </div>
  )
}

function ResourceCard({ titleKey, descriptionKey, icon, link, color }) {
  const { language } = useLanguage()
  const colorClasses = {
    red: "hover:border-red-200 hover:bg-red-50",
    blue: "hover:border-blue-200 hover:bg-blue-50",
    green: "hover:border-green-200 hover:bg-green-50",
  }

  return (
    <Card
      className={`
      flex flex-col h-full 
      transition-all duration-300 
      rounded-xl
      border-2 border-transparent
      hover:shadow-xl
      transform hover:-translate-y-1
      ${colorClasses[color]}
    `}
    >
      <CardHeader className="p-6">
        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
          <div className="p-3 rounded-lg bg-white shadow-sm">{icon}</div>
          <span className="ml-3">{translate(titleKey, language)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-6 pt-0">
        <CardDescription className="text-gray-600 mb-6 flex-grow text-base">{translate(descriptionKey, language)}</CardDescription>
        <Link href={link} target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            className="w-full group rounded-lg h-12 border-2 hover:border-current
              transition-all duration-300 hover:shadow-md"
          >
            {translate('exploreResources', language)}
            <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function VideoResourceCard({ title, description, link }) {
  const { language } = useLanguage()
  
  return (
    <Card className="flex flex-col h-full transition-all duration-300 rounded-xl hover:shadow-xl transform hover:-translate-y-1">
      <CardHeader className="p-6">
        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
          <div className="p-3 rounded-lg bg-white shadow-sm">
            <Youtube className="h-6 w-6 text-red-600" />
          </div>
          <span className="ml-3">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-6 pt-0">
        <CardDescription className="text-gray-600 mb-6 flex-grow text-base">{description}</CardDescription>
        <Link href={link} target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            className="w-full group rounded-lg h-12 border-2 hover:border-current
              transition-all duration-300 hover:shadow-md"
          >
            {translate('watchVideo', language)}
            <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

