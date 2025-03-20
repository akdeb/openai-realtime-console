import { Button } from "@/components/ui/button";
import { Hospital, Sparkle, ChevronDown, Dog, Bird, Hop, Wand, Plus } from "lucide-react";
import {
    DropdownMenuSeparator,
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuGroup,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";

const ICON_SIZE = 22;

interface LeftNavbarButtonsProps {
    user: IUser | null;
}

export default function LeftNavbarButtons({ user }: LeftNavbarButtonsProps) {
    const isDoctor = user?.user_info.user_type === "doctor";
    const hospitalName = (user?.user_info.user_metadata as IDoctorMetadata).hospital_name; 
    const firstWordOfHospital = hospitalName ? hospitalName.split(' ')[0] : '';

    const isHealthcare = usePathname().includes("/healthcare");
    const isHome = usePathname().includes("/home");

    const shouldShowHospital = isDoctor && firstWordOfHospital.length && isHome;

    return (
        <div className="flex flex-row gap-4 sm:gap-10 items-center">
            <a className="flex flex-row gap-3 items-center" href="/">
                <Wand size={ICON_SIZE} />
                <p
                    className={`mt-4 flex items-center font-borel font-bold text-xl text-stone-800 dark:text-stone-100 relative`}
                >
{shouldShowHospital ? (
                      <>
                        <span>Elato | <span className="text-stone-500">{firstWordOfHospital}</span></span>
                        <span className="absolute -top-3 -right-3 text-stone-500"><Plus size={12} strokeWidth={3} /></span>
                      </>
                    ) : (
                      <span>Elato</span>
                    )}
                </p>
            </a>
            {!isHome && (
                <DropdownMenu
                    onOpenChange={(open) => {
                        if (!open) {
                            // Remove focus from any active element when dropdown closes
                            document.activeElement instanceof HTMLElement &&
                                document.activeElement.blur();
                        }
                    }}
                >
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex flex-row gap-2 items-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
                        >
                            <span className="font-medium text-md hidden sm:flex">
                                Use cases
                            </span>
                            <ChevronDown size={18} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56 p-2 sm:mt-2 rounded-lg"
                        side="bottom"
                        align="start"
                    >
                        <DropdownMenuLabel>Use Cases</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <a
                                    href="/healthcare"
                                    className={`flex flex-row gap-2 w-full items-center justify-between ${
                                        isHealthcare
                                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                                            : ""
                                    }`}
                                >
                                    <div className="flex flex-row gap-2 items-center">
                                        <Hospital size={ICON_SIZE - 6} />
                                        <span>Elato for Healthcare</span>
                                    </div>
                                    {isHealthcare && (
                                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                                    )}
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a
                                    href="/"
                                    className={`flex flex-row gap-2 w-full items-center justify-between ${
                                        !isHealthcare
                                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                                            : ""
                                    }`}
                                >
                                    <div className="flex flex-row gap-2 items-center">
                                        <Sparkle
                                            size={ICON_SIZE - 6}
                                            fill="currentColor"
                                        />
                                        <span>Elato for Kids</span>
                                    </div>
                                    {!isHealthcare && (
                                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                                    )}
                                </a>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}
