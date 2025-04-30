import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

const ICON_SIZE = 22;

interface LeftNavbarButtonsProps {
    user: IUser | null;
}

export default function LeftNavbarButtons({ user }: LeftNavbarButtonsProps) {
    const isDoctor = user?.user_info.user_type === "doctor";
    const pathname = usePathname();

    let firstWordOfHospital = '';
    if (isDoctor) {
        const hospitalName = (user?.user_info.user_metadata as IDoctorMetadata).hospital_name; 
        firstWordOfHospital = hospitalName ? hospitalName.split(' ')[0] : '';
    }

    const isRoot = pathname === "/";
    const isHome = pathname.includes("/home");
    const isLabs = pathname.includes("/labs");

    const shouldShowHospital = isDoctor && firstWordOfHospital.length && isHome;

    return (
        <div className="flex flex-row gap-4 sm:gap-10 items-center">
            {isLabs ? <Button
            variant="outline"
            className="flex flex-row gap-2 items-center px-4 py-2 rounded-lg"
            asChild
            aria-label="Go to Home page"
            title="Click to go to Home page"
        >
            <a href="https://www.elatoai.com">
                <Home size={18} className="mr-1" />
                <p className="flex items-center font-silkscreen text-xl">
                    <span>Elato</span>
                </p>
                <span className="text-xl">👾</span>
            </a>
        </Button> :<a className="flex flex-row gap-3 items-center" href="/">
                <p
                    className={`flex items-center flex-row gap-2 font-silkscreen text-2xl text-stone-800 dark:text-stone-100 relative`}
                >
 <span>Elato</span><span className="text-2xl">👾</span>
                </p>
            </a>}
        </div>
    );
}
