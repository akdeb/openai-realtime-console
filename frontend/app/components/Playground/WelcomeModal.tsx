import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import {	
    Drawer,
    DrawerContent,
} from "@/components/ui/drawer";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Globe, Smartphone, Cpu, CreditCard, Key } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WelcomeModalProps {
    currentUser: IUser;
}

const WelcomeContent = ({ onClose }: { onClose: () => void }) => {
	const [activeTab, setActiveTab] = useState("access");
    
    const goToDevicesTab = () => {
        setActiveTab("devices");
    };

	const router = useRouter();

	const addAPIKey = () => {
		router.push("/home/settings#register");
		onClose();
	}

    return (
		        <div className="space-y-3">
            <div className="text-center mb-3">
                <h2 className="text-xl font-bold">Welcome to Elato!</h2>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="access">Choose Access</TabsTrigger>
                    <TabsTrigger value="devices">Choose Device</TabsTrigger>
                </TabsList>
                
                {/* Tab 1: API Key vs Subscription */}
                <TabsContent value="access" className="space-y-4">
                    <p className="text-sm text-center text-muted-foreground mb-3">
                        How would you like to access our AI characters?
                    </p>
                    
                    {/* Option 1: Subscription */}
                    <div className="p-3 rounded-lg border hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                            <h3 className="font-semibold">Premium Subscription</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">$10/month for unlimited access</p>
                        <Button 
                            size="sm"
                            className="mt-2 w-full bg-blue-600 hover:bg-blue-700" 
                            onClick={goToDevicesTab}
                        >
                            Subscribe & Continue
                        </Button>
                    </div>

                    {/* Option 2: API Key */}
                    <div className="p-3 rounded-lg border hover:border-gray-400 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                            <Key className="w-4 h-4 text-gray-600" />
                            <h3 className="font-semibold">Use Your OpenAI API Key</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Bring your own API key</p>
                        <Button 
                            size="sm"
                            variant="outline"
                            className="mt-2 w-full" 
                            onClick={goToDevicesTab}
                        >
                            Add Key & Continue
                        </Button>
                    </div>
                </TabsContent>
                
                {/* Tab 2: Device Options */}
                <TabsContent value="devices" className="space-y-4">
                    <p className="text-sm text-center text-muted-foreground mb-3">
                        How would you like to use Elato AI?
                    </p>
                    
                    {/* Device Option - PRIMARY */}
                    <div className="p-4 rounded-lg border-2 border-purple-300 bg-purple-50/50 dark:bg-purple-900/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
                                <Smartphone className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Elato AI Device</h3>
                                <p className="text-xs text-muted-foreground">
                                    Premium voice interaction with portable device
                                </p>
                            </div>
                        </div>
                        <Button 
                            size="sm"
                            className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={onClose}
                        >
                            Learn More
                        </Button>
                    </div>

                    {/* DevKit and Web options */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* AI DevKit */}
                        <div className="p-3 rounded-lg border hover:border-blue-300 transition-colors">
                            <div className="flex flex-col items-center text-center">
                                <Cpu className="w-5 h-5 text-blue-600 mb-2" />
                                <h3 className="font-medium text-sm">Elato AI DevKit</h3>
                                <p className="text-xs text-muted-foreground">Build your own AI device</p>
                            </div>
                        </div>

                        {/* Web Option */}
                        <div className="p-3 rounded-lg border hover:border-gray-400 transition-colors">
                            <div className="flex flex-col items-center text-center">
                                <Globe className="w-5 h-5 text-gray-600 mb-2" />
                                <h3 className="font-medium text-sm">Web App</h3>
                                <p className="text-xs text-muted-foreground">Use in browser</p>
                                <Button 
                                    size="sm"
                                    variant="ghost"
                                    className="mt-1 text-xs"
                                    onClick={onClose}
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
            
            <div className="text-xs text-center text-muted-foreground pt-2">
                You can change these options later in settings
            </div>
        </div>
    );
};

const WelcomeModal: React.FC<WelcomeModalProps> = ({ currentUser }) => {
    const [open, setOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const supabase = createClient();

    useEffect(() => {
        const checkShouldShowModal = async () => {
            // Check if user has any conversations
            const { count } = await supabase
                .from('conversations')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUser.user_id);
            
            if (count === 0) {
                setOpen(true);
            }
        };
        
        checkShouldShowModal();
    }, [currentUser.user_id, supabase]);

    const handleClose = () => {
        // Store that user has seen the modal
        localStorage.setItem(`welcome_modal_seen_${currentUser.user_id}`, 'true');
        setOpen(false);
    };

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <WelcomeContent onClose={handleClose} />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <div className="px-4 py-6 mx-auto">
                    <WelcomeContent onClose={handleClose} />
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default WelcomeModal;