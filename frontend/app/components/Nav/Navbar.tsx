"use client";

import { useEffect, useState } from "react";
import NavbarButtons from "./NavbarButtons";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePathname } from "next/navigation";
import LeftNavbarButtons from "./LeftNavbarButtons";

export function Navbar({
    user,
    stars,
}: {
    user: IUser | null;
    stars: number | null;
}) {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const pathname = usePathname();
    const isProduct = pathname.includes("/products");
    const isHome = pathname.includes("/home");
    const isRoot = pathname === "/";

    useEffect(() => {
        if (typeof window !== "undefined") {
            const handleScroll = () => {
                const currentScrollY = window.scrollY;
                setIsVisible(
                    currentScrollY <= 0 || currentScrollY < lastScrollY
                );
                setLastScrollY(currentScrollY);
            };
    
            window.addEventListener("scroll", handleScroll, { passive: true });
            return () => window.removeEventListener("scroll", handleScroll);
        }
    }, [lastScrollY]);

    return (
        <div
            className={`backdrop-blur-[3px] flex-none flex items-center sticky top-0 z-50 transition-transform duration-300 h-[80px] ${
                // isVisible ? "translate-y-0" : "-translate-y-full"
                "translate-y-0"
            } ${!isHome ? "h-[80px]" : "h-[60px]"}`}
            style={{
                backgroundColor: isRoot && lastScrollY === 0 ? "#FCFAFF" : "transparent",
                transition: "background-color 0.3s ease"
            }}
        >
            {!isHome && (
                <div className="fixed h-8 top-0 flex items-center justify-center w-full bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 text-center font-medium text-yellow-800 dark:text-yellow-200 z-40 gap-2 text-sm">
                    ⭐️ Starmoon has a new home!
                </div>
            )}
            <nav
                className={`mx-auto w-full max-w-[1440px] px-4 flex items-center justify-between ${
                    !isHome ? "pt-8" : ""
                }`}
            >
                <LeftNavbarButtons user={user} />
                <NavbarButtons user={user} stars={stars} isHome={isHome} />
            </nav>
        </div>
    );
}
