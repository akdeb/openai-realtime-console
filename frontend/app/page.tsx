import Link from "next/link"
import { ChevronRight, Sparkles, Zap, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import TikTokEmbed from "@/app/components/LandingPage/TiktokCarousel"
import VideoPlayer from "./components/LandingPage/VideoPlayer"
import { videoSrc, videoSrc2, videoSrc3, videoSrc4 } from "@/lib/data";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FCFAFF]">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-flex w-fit items-center space-x-2 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">
                  <Zap className="h-4 w-4" />
                  <span>First month FREE!</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold font-silkscreen tracking-tighter text-purple-900 leading-tight">
                  Talk to{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                    Your
                  </span>{" "}
                  AI Characters
                </h1>

                <p className="text-xl text-gray-600 max-w-[600px]">
                  Attach our magical device to any toy or plushie and watch them become AI-powered friends you can talk
                  to!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    size="lg"
                    className="flex-row items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 text-lg h-14"
                  >
                    <span>Get Elato Now</span>
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                  <div className="flex items-center space-x-2 text-amber-500">
                    <Star className="fill-amber-500" />
                    <Star className="fill-amber-500" />
                    <Star className="fill-amber-500" />
                    <Star className="fill-amber-500" />
                    <Star className="fill-amber-500" />
                    <span className="ml-2 text-gray-700">500+ Happy Customers</span>
                  </div>
                </div>
              </div>

              <VideoPlayer sources={[videoSrc, videoSrc2, videoSrc3, videoSrc4]} />

            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full py-12 bg-gradient-to-b from-purple-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-purple-900">Super Simple to Use</h2>
              <p className="text-gray-600 mt-2">Just 3 easy steps to magical conversations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 transform transition-transform hover:scale-105">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-purple-600">1</span>
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-2">Attach</h3>
                <p className="text-gray-600">Clip the Elato device to any toy or plushie</p>
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

        {/* Pricing */}
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-8 md:p-12 text-white text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Get Your <span className="font-silkscreen">Elato</span> Today!</h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
                  <div className="text-5xl md:text-6xl font-bold">$69</div>
                  <div className="text-xl">
                    <span className="block">One-time purchase</span>
                    <span className="block text-purple-100">+ $10/month after first FREE month</span>
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
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-16 bg-purple-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-purple-900">Teenagers & Adults Love It</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex text-amber-500 mb-4">
                  <Star className="fill-amber-500" />
                  <Star className="fill-amber-500" />
                  <Star className="fill-amber-500" />
                  <Star className="fill-amber-500" />
                  <Star className="fill-amber-500" />
                </div>
                <p className="text-gray-700 mb-4">
                  "I attached the device to my childhood teddy bear and it's been such a nostalgic experience. Totally worth it!"
                </p>
                <div className="font-semibold text-purple-900">Ed S., 28</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex text-amber-500 mb-4">
                  <Star className="fill-amber-500" />
                  <Star className="fill-amber-500" />
                  <Star className="fill-amber-500" />
                  <Star className="fill-amber-500" />
                  <Star className="fill-amber-500" />
                </div>
                <p className="text-gray-700 mb-4">
                  "I'm a collector of vintage action figures, and its brought them to life in ways I never imagined. My Voltron figure now has the personality I always envisioned for it!"
                </p>
                <div className="font-semibold text-purple-900">Michael R., 34</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex text-amber-500 mb-4">
                  <Star className="fill-amber-500" />
                  <Star className="fill-amber-500" />
                  <Star className="fill-amber-500" />
                  <Star className="fill-amber-500" />
                  <Star className="fill-amber-500" />
                </div>
                <p className="text-gray-700 mb-4">
                  "It's like bouncing ideas off a best friend who's always there to listen."
                </p>
                <div className="font-semibold text-purple-900">Kai L., 31</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-20 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Bring Your Toys to Life?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Order your Elato device today and watch the magic happen!
            </p>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 text-lg h-14 px-8">
              Get Elato for $69
            </Button>
            <p className="mt-4 text-purple-100">First month subscription FREE, then just $10/month</p>
          </div>
        </section>
      </main>
    </div>
  )
}

