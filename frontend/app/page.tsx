import { createClient } from "@/utils/supabase/server";
import { getAllPersonalities } from "@/db/personalities";
import EndingSection from "./components/LandingPage/EndingSection";
import FrontPage from "./components/LandingPage/FrontPage";
import Personalities from "./components/LandingPage/Personalities";
import { Button } from "@/components/ui/button";
import { Gamepad2, SmilePlus, Command, MessagesSquare, Bookmark, Share2, MessageCircle, Heart, Share } from "lucide-react";
import PreorderButton from "./components/PreorderButton";
import Link from "next/link";
import Usecases from "./components/LandingPage/Usecases";

const videoSrc = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/IMG_1673.mov`;
const videoSrc2 = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/IMG_1675.mov`;

const ICON_SIZE = 28;

export default async function Index() {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const allPersonalities = await getAllPersonalities(supabase);

    return (
        <main className="flex flex-1 flex-col mx-auto w-full gap-10 sm:py-4 py-0">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between max-w-screen-lg mx-auto px-4">
                <div className="md:w-1/2">
                    <FrontPage
                        user={user ?? undefined}
                        allPersonalities={allPersonalities}
                    />
                    
                    <div className="flex flex-row gap-4 items-center justify-center mt-8">
                        <PreorderButton
                            size="lg"
                            buttonText="Buy Now"
                            className="h-10"
                        />
                        <Link href={user ? "/home" : "/login"}>
                            <Button className="flex flex-row items-center bg-white gap-2 font-medium text-base text-stone-800 leading-8 rounded-full border-2 border-stone-900 hover:bg-gray-100">
                                <Gamepad2 size={20} />
                                <span>Sign Up</span>
                            </Button>
                        </Link>
                    </div>
                </div>
                
                <div className="w-full md:w-1/2 mt-6 md:mt-0">
                <div className="relative aspect-[9/16] max-h-[85vh] w-full">
                        <video 
                            className="w-full h-full object-cover rounded-xl shadow-lg" 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                        >
                            <source src={videoSrc} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        
                        {/* TikTok-style icons */}
                        <div className="absolute bottom-2 right-2 flex flex-col gap-4">
                        <button className="bg-transparent bg-opacity-50 rounded-full p-2 transition-transform hover:scale-110">
                                <Heart size={ICON_SIZE} color="rgb(239, 68, 68" fill="rgb(239, 68, 68)"  />
                            </button>
                            
                            <button className="bg-transparent bg-opacity-50 rounded-full p-2 transition-transform hover:scale-110">
                                <MessageCircle size={ICON_SIZE} color="white" />
                            </button>

                            <button className="bg-transparent bg-opacity-50 rounded-full p-2 transition-transform hover:scale-110">
                                <Bookmark size={ICON_SIZE} color="rgb(250, 204, 21)" fill="rgb(250, 204, 21)"  />
                            </button>
                            
                            <button className="bg-transparent bg-opacity-50 rounded-full p-2 transition-transform hover:scale-110">
                                <Share2 size={ICON_SIZE} color="white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Personalities allPersonalities={allPersonalities} />

            {/* <CharacterCarousel /> */}

            {/* <div className="max-w-4xl text-center mx-8 mt-20 md:mx-auto">
                <h1 className="text-lg font-normal text-gray-700 mb-2">
                    With a character for every occasion including
                </h1>

                <AnimatedText />
            </div>
            <Personalities allPersonalities={allPersonalities} /> */}

            {/* <InteractiveView /> */}
            {/* <Demo /> */}
            <section
                id="how-it-works"
                className="w-full max-w-screen-lg mx-auto py-12"
            >
                <div className="space-y-4 sm:max-w-sm max-w-[300px] mx-auto">
                            <h3 className="text-3xl font-semibold flex flex-row items-center gap-2 justify-between text-amber-400">
                                <span>1. Pick their favorite story </span><SmilePlus size={40} />
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 font-normal text-lg">
                                Select from a wide range of AI characters, each
                                with unique personalities, stories and knowledge bases.
                            </p>
                            <h3 className="text-3xl font-semibold flex flex-row items-center gap-2 justify-between text-amber-500">
                                <span>2. Connect the toy </span><Command size={40} />
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Easily set up your Elato device with your
                                home Wi-Fi network or Personal hotspot.
                            </p>
                            <h3 className="text-3xl font-semibold flex flex-row items-center gap-2 justify-between text-amber-600">
                                <span>3. Begin a new adventure </span><MessagesSquare size={40} />
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Your characters are now always ready to chat.
                                Talk to your device anytime and watch as they
                                respond in real-time with personalized
                                interactions.
                            </p>
                        </div>
            </section>
            {/* <CharacterPicker allPersonalities={allPersonalities} /> */}
            <Usecases />
            {/* <FeaturesSection /> */}
            <EndingSection />
        </main>
    );
}
