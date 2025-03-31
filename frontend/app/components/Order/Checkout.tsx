"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { DEVICE_COST, ORIGINAL_COST, paymentLink } from "@/lib/data";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
const Checkout = () => {
    const { toast } = useToast();

    const [numberOfUnits, setNumberOfUnits] = useState(1);
    const [productColor, setProductColor] = useState<ProductColor>("white");

    const incrementUnits = () => {
        setNumberOfUnits((prev) => prev + 1);
    };

    const decrementUnits = () => {
        setNumberOfUnits((prev) => Math.max(1, prev - 1));
    };

    const deviceCost = numberOfUnits * DEVICE_COST;
    const originalCost = numberOfUnits * ORIGINAL_COST;
    const totalSavings = originalCost - deviceCost;

    const freeShipping = deviceCost >= 100;

    const handleCheckout = async () => {
        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    quantity: numberOfUnits,
                    color: productColor,
                    free_shipping: freeShipping,
                }),
            });

            if (!response.ok) {
                throw new Error();
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Payment Error",
                description:
                    "There was an error processing your payment. Please try again or reach out if this persists.",
            });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 flex-wrap">
                <div className="text-3xl font-semibold">${deviceCost}</div>
                <div className="text-lg font-medium text-gray-400 line-through">
                    ${originalCost}
                </div>
                <Badge variant="secondary" className="font-medium rounded-md">
                    Save ${totalSavings.toFixed(0)}
                </Badge>
            </div>
            {freeShipping && (
                    <p className="text-sm text-gray-400">FREE Shipping</p>
                )}
            <div className="flex items-center gap-4 mb-6">
                {/* <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-md">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={decrementUnits}
                            className="h-10 px-3 hover:bg-gray-100"
                        >
                            <Minus className="h-4 w-4" />
                        </Button>

                        <input
                            type="number"
                            value={numberOfUnits}
                            onChange={(e) =>
                                setNumberOfUnits(
                                    Math.max(1, parseInt(e.target.value) || 1)
                                )
                            }
                            className="w-16 text-center border-x bg-white h-10 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="1"
                        />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={incrementUnits}
                            className="h-10 px-3 hover:bg-gray-100"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div> */}

                <Link href={paymentLink}>
                <Button
                    size="lg"
                    // className="w-full h-10 rounded-full"
                    className="w-full rounded-full sm:w-auto flex-row items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 text-lg h-14"

                    // variant="upsell_primary"
                    // onClick={handleCheckout}
                >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Buy Now
                </Button>
                </Link>
            </div>
        </div>
    );
};

export default Checkout;
