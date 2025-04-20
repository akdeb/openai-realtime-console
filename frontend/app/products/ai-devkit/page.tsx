import { Badge } from "@/components/ui/badge";
import { Truck, Box, Code, BatteryCharging } from "lucide-react";
import Checkout from "../../components/Order/Checkout";
import FAQ, { qnaProps } from "../../components/Order/FAQ";
import Specs from "../../components/Order/Specs";
import { devkitPaymentLink } from "@/lib/data";
import YoutubeDemo from "../../components/LandingPage/YoutubeDemo";
import ProductGallery from "../../components/LandingPage/ProductGallery";
import { CreditCardIcon, PowerIcon, ShieldCheckIcon, Settings2Icon, FileTextIcon, WifiIcon } from "lucide-react";


const SubtitleText =
    "The AI Devkit comes with a fully assembled PCB with an attachable Microspeaker and a 3.7V LiPo battery. Once charged it powers unlimited AI conversations with your AI characters.";


const images = [
    {
        src: "/products/devkit1.png",
        alt: "Elato Device - white",
    },
    {
        src: "/products/devkit2.png",
        alt: "Elato Device - gray",
    },
    {
        src: "/products/devkit3.png",
        alt: "Elato Device - white",
    },
    {
        src: "/products/devkit4.png",
        alt: "Elato Device - gray",
    },
    {
        src: "/products/devkit5.png",
        alt: "Elato Device - black",
    },
    {
        src: "/products/devkit6.png",
        alt: "Elato Device - white",
    },
];

const ICON_SIZE = 20;

const qna: qnaProps[] = [
	{
		question: "What is the AI Devkit?",
		answer: "The AI Devkit is a fully assembled PCB with an attachable Microspeaker and a 3.7V LiPo battery. Once charged it you can use it to have unlimited AI conversations with your AI characters.",
		icon: <Box size={ICON_SIZE} />,
	},
	{
		question: "Can I burn my own firmware to the AI Devkit?",
		answer: "Yes! You can burn your own firmware to the AI Devkit using the Arduino IDE. Our Github highlights the steps to run your firmware, edge server, and backend locally.",
		icon: <Code size={ICON_SIZE} />,
	},
	{
		question: "What is the battery life of the AI Devkit?",
		answer: "The AI Devkit has a 3.7V LiPo battery that lasts for 4-6 hours on a single charge. You can charge it using the USB Type-C port on the device.",
		icon: <BatteryCharging size={ICON_SIZE} />,
	},
    {
        question: "What happens after the 1-month free premium subscription?",
        answer: "After your 1-month free trial, you can choose to continue with the premium features for $10/month, or use our free tier with limited usage. We'll remind you before the trial ends, so you can decide what's best for you.",
        icon: <CreditCardIcon size={ICON_SIZE} />,
    },
    {
        question: "How do I set up my Elato?",
        answer: "Setting up your Elato is easy. Just press the main button on the device, find the ELATO-DEVICE wifi network, and register your device with your email. You'll be chatting with your favorite AI character in seconds.",
        icon: <PowerIcon size={ICON_SIZE} />,
    },
    {
        question: "Can I use Elato AI with any home wifi network?",
        answer: "Yes! Elato AI will automatically connect to up to 5 private wifi networks or your phone hotspot. If you are having trouble connecting, please try restarting the device.",
        icon: <WifiIcon size={ICON_SIZE} />,
    },
];

const includedItems = [
    "Fully assembled PCB",
    "Speaker",
    "3.7V LiPo Battery",
    "USB Type-C Charging Cable",
    "1 Month FREE Premium Subscription",
    "Quick Start Guide",
];

const technicalSpecs = [
    "Dimensions: 4cm x 3.8cm x 0.5cm",
    "Battery Life: 4+ days standby, 6 hours active use",
    "Connectivity: Bluetooth 2.4 GHz, Wi-Fi + Hotspot",
    "Access any AI character from Elato",
    "Create your AI character with any voice and a bespoke personality",
];

export default function Component() {
    return (
        <div className="container px-0 mx-auto">
            {/* <ProductsAndSub /> */}
            {/* Hero Section */}
            <div className="flex flex-col-reverse gap-6 sm:gap-12 md:flex-row items-start sm:mt-4 mb-16">
                <div className="w-full md:w-3/5 px-4">
                <ProductGallery images={images} />
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
                        AI Dev Kit
                    </h1>
                    <p className="text-lg text-muted-foreground mb-6 -mt-2">
                        {SubtitleText}
                    </p>
                    <Checkout deviceCost={45} originalCost={100} paymentLink={devkitPaymentLink} />
                </div>
            </div>
            {/* <div className="my-12 px-4">
                <YoutubeDemo caption={"This demo shows the AI Devkit in action"} />
            </div> */}
            
            {/* <ProductCarousel /> */}
            <div className="flex flex-col gap-12 px-6">
                {/* Product Details */}
                <Specs includedItems={includedItems} technicalSpecs={technicalSpecs} />
                {/* Key Features */}
                {/* <KeyFeatures /> */}

                {/* Testimonials */}
                {/* <Reviews /> */}

                {/* FAQ Section */}
                <FAQ qna={qna} />

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
