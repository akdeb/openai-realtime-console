import Link from "next/link"
import { ChevronRight, Zap, Star, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DEVICE_COST, SUBSCRIPTION_COST } from "@/lib/data";
import { createClient } from "@/utils/supabase/server"
import { getAllPersonalities } from "@/db/personalities"
import { CharacterShowcase } from "../components/LandingPage/CharacterShowcase";
import { CreateCharacterShowcase } from "../components/LandingPage/CreateCharacterShowcase";
import ProductsSection from "../components/LandingPage/ProductsSection";
import Image from "next/image";
import { fetchGithubStars } from "../actions";
import { FaGithub } from "react-icons/fa";
export default async function LandingPage() {
  const supabase = createClient();
  const allPersonalities = await getAllPersonalities(supabase);
  const adultPersonalities = allPersonalities.filter((personality) => !personality.is_story && !personality.is_child_voice);
  const { stars } = await fetchGithubStars("akdeb/ElatoAI");

  return (
    <div className="flex min-h-screen flex-col bg-[#FCFAFF]">
      <main className="flex-1">
        {/* Hero Section */}
{/* Hero Section */}
<section className="w-full py-12 md:py-16">
  <div className="container px-4 md:px-6 max-w-screen-lg mx-auto">
    <div className="flex flex-col items-center justify-center space-y-8">
      <h1 className="text-5xl text-center md:text-6xl font-bold tracking-tight text-purple-900" style={{ lineHeight: '1.2' }}>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
          Realtime, Conversational AI
        </span>{" "} 
        on ESP32 with Arduino and Edge Functions
      </h1>

      <p className="text-xl text-gray-600 text-center max-w-[600px]">
        Attach your <span className="font-silkscreen mx-1">Elato</span> device to any toy or plushie and talk to them with Realtime Speech-to-speech AI!
      </p>
      
      <div className="flex items-center space-x-2 justify-center text-amber-500 my-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="fill-amber-500" />
        ))}
        <span className="ml-2 text-gray-700">200+ Happy Customers</span>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-md my-2">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/products" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 text-lg h-14"
            >
              Get Elato Now
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
          
          <Link href="/home" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-purple-600 text-purple-600 hover:bg-purple-50 text-lg h-14"
            >
              See Characters
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center space-y-3 mt-2">
          <p className="text-gray-700 text-sm">If you like this project, please star it on GitHub!</p>
          <a 
            href="https://github.com/akdeb/ElatoAI" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center bg-gray-900 hover:bg-gray-800 transition-colors text-white px-4 py-2 rounded-md"
          >
            <FaGithub size={24} className="mr-2"/>
            <span className="font-medium">Star on GitHub</span>
            <span className="ml-2 bg-white text-gray-900 px-2 py-0.5 rounded-md text-xs font-bold">{stars}</span>
          </a>
        </div>
      </div>

      <div className="w-full mt-8">
        <h3 className="text-center text-sm font-medium text-gray-500 mb-6">POWERED BY</h3>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-10">
          {[
            { name: "Vercel", height: "36px" },
            { name: "Deno", height: "36px" },
            { name: "Supabase", height: "48px" },
            { name: "Arduino", height: "36px" },
            { name: "Espressif ESP32", height: "24px", key: "espressif" },
            { name: "PlatformIO", height: "36px" }
          ].map(({name, height, key}) => (
            <a 
              key={key || name.toLowerCase()} 
              href={`https://${key || name.toLowerCase()}.${name === "Espressif ESP32" ? "com" : name === "Arduino" ? "cc" : "com"}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="transition-all hover:opacity-80"
            >
              <Image 
                src={`/logos/${key || name.toLowerCase()}.png`} 
                alt={name} 
                width={100} 
                height={24} 
                style={{ height, width: 'auto' }} 
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>

        {/* Products Section */}
        <ProductsSection />

                {/* How It Works */}
                <section className="w-full py-12 bg-gradient-to-b from-purple-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
                Super Simple to Use
              </h2>
              <p className="text-lg text-gray-600 mt-2">Just 3 easy steps to epic conversations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 transform transition-transform hover:scale-105">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-purple-600">1</span>
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-2">Attach</h3>
                <p className="text-gray-600">Attach the Elato device to any toy or plushie</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 transform transition-transform hover:scale-105">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-2">Configure</h3>
                <p className="text-gray-600">Use our <a href="/home" className="text-purple-600">web app</a> to set up your toy's personality</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 transform transition-transform hover:scale-105">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-2">Talk</h3>
                <p className="text-gray-600">Start chatting with your toy - it's that simple!</p>
              </div>
            </div>
          </div>
        </section>


        {/* Character Showcase */}
        <CharacterShowcase allPersonalities={adultPersonalities} />

        {/* Create Character Showcase */}
        <CreateCharacterShowcase />

        {/* Pricing */}
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-8 md:p-12 text-white text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Get Your <span className="font-silkscreen">Elato</span> Today!</h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
                  <div className="text-5xl md:text-6xl font-bold">${DEVICE_COST}</div>
                  <div className="text-xl">
                    <span className="block">One-time purchase</span>
                    <span className="block text-purple-100">+ ${SUBSCRIPTION_COST}/month after first FREE month<br /> <span className="text-xs">(or use your own OpenAI API key)</span></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left max-w-2xl mx-auto">
                  <div className="flex items-start space-x-2">
                    <div className="bg-white rounded-full p-1 mt-1">
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>Works with ANY toy or plushie</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="bg-white rounded-full p-1 mt-1">
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>Create unlimited AI characters</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="bg-white rounded-full p-1 mt-1">
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>First month subscription FREE</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="bg-white rounded-full p-1 mt-1">
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>Easy to set up in minutes</span>
                  </div>
                </div>

                <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 text-lg h-14 px-8">
                  <Link href={"/products"}>Buy Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

