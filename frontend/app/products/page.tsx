import { Badge } from "@/components/ui/badge";
import { Truck, Bird, Box } from "lucide-react";
import ProductImageCarousel from "../components/Order/ProductImageCarousel";
import Checkout from "../components/Order/Checkout";
import FAQ from "../components/Order/FAQ";
import Reviews from "../components/Order/Reviews";
import Specs from "../components/Order/Specs";
import KeyFeatures from "../components/Order/KeyFeatures";
import { videoSrc, videoSrc2, videoSrc3, videoSrc4 } from "@/lib/data";
import VideoPlayer from "../components/LandingPage/VideoPlayer";
import ProductCarousel from "../components/ProductCarousel";
import YoutubeDemo from "../components/LandingPage/YoutubeDemo";
import ProductGallery from "../components/LandingPage/ProductGallery";
const SubtitleText =
    "All AI characters packed into one fully assembled compact device that can be added to any object.";

export default function Component() {
    return (
        <div className="container px-0 mx-auto">
            {/* <ProductsAndSub /> */}
            {/* Hero Section */}
            <div className="flex flex-col-reverse gap-6 sm:gap-12 md:flex-row items-start sm:mt-4 mb-16">
                <div className="w-full md:w-3/5 px-4">
                <ProductGallery />
                </div>
                <div className="md:w-2/5 px-6 mt-6">
                    <div className="flex flex-row items-center gap-2 mb-4">
                        <Badge
                            variant="secondary"
                            className="text-sm border-0 flex flex-row items-center gap-1 text-white bg-gradient-to-r from-yellow-500 to-amber-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-center"
                        >
                            <Box size={16} /> {"Early Bird"}
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="text-sm font-medium rounded-lg text-center flex flex-row items-center gap-1"
                        >
                            <Truck size={16} /> {"Kickstarter Pre-Order!"}
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-silkscreen mt-10 mb-4 font-semibold tracking-tight sm:text-4xl">
                        Elato 
                    </h1>
                    <p className="text-lg text-muted-foreground mb-6 -mt-2">
                        {SubtitleText}
                    </p>
                    <Checkout />
                    <p className="text-sm text-muted-foreground/90">
                        *Buy now to get access to Elato Premium
                        FREE for 1 month. Fast shipping in 1 week.
                    </p>
                </div>
            </div>
            <div className="my-12 px-4">
                <YoutubeDemo />
            </div>
            
            {/* <ProductCarousel /> */}
            <div className="flex flex-col gap-12 px-6">
                {/* Product Details */}
                <Specs />
                {/* Key Features */}
                {/* <KeyFeatures /> */}

                {/* Testimonials */}
                {/* <Reviews /> */}

                {/* FAQ Section */}
                <FAQ />

                {/* Final CTA */}
                {/* <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">
                    Ready to Meet Your New AI-in-a-Box?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                    Order now and start your adventure with Elato AI!
                </p>
                <Button size="lg" className="text-lg px-8">
                    Get Your Elato AI Today{" "}
                    <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
            </div> */}

                {/* Delivery Notice */}
            </div>
        </div>
    );
}
