"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getCreditsRemaining } from "@/lib/utils";
import PickPersonality from "./PickPersonality";
import { updateUser } from "@/db/users";
import _ from "lodash";
import HomePageSubtitles from "../HomePageSubtitles";
import PersonalityFilters from "./PersonalityFilters";
import { TranscriptProvider } from "../Realtime/contexts/TranscriptContext";
import { EventProvider } from "../Realtime/contexts/EventContext";
import App from "../Realtime/App";
import { checkIfUserHasApiKey } from "@/app/actions";
import { defaultPersonalityId } from "@/lib/data";
import WelcomeModal from "./WelcomeModal";
interface PlaygroundProps {
    currentUser: IUser;
    allPersonalities: IPersonality[];
    myPersonalities: IPersonality[];
}

const Playground: React.FC<PlaygroundProps> = ({
    currentUser,
    allPersonalities,
    myPersonalities,
}) => {
    const supabase = createClient();
    const [hasApiKey, setHasApiKey] = useState<boolean>(false);
    const isDoctor = currentUser.user_info.user_type === "doctor";

    useEffect(() => {
        const checkApiKey = async () => {
            const hasApiKey = await checkIfUserHasApiKey(currentUser.user_id);
            setHasApiKey(hasApiKey);
        };
        checkApiKey();
    }, [currentUser.user_id, supabase]);

    // Remove userState entirely and just use personalityState
    const [personalityIdState, setPersonalityIdState] = useState<string>(
        currentUser.personality!.personality_id ?? defaultPersonalityId // Initial value from props
    );

    const [selectedFilters, setSelectedFilters] = useState<PersonalityFilter[]>(
        []
    );

    const creditsRemaining = getCreditsRemaining(currentUser);
    const outOfCredits = creditsRemaining <= 0 && !currentUser.is_premium;
    // const ref: any = useRef<ComponentRef<typeof Messages> | null>(null);

    const onPersonalityPicked = async (personalityIdPicked: string) => {
        // Instantaneously update the state variable
        setPersonalityIdState(personalityIdPicked);
        await updateUser(
            supabase,
            {
                personality_id: personalityIdPicked,
            },
            currentUser.user_id
        );
    };

    return (
        <div className="flex flex-col">
            {/* <WelcomeModal currentUser={currentUser} /> */}
            <div className="flex flex-col w-full gap-2">
                <div className="flex flex-row items-center gap-4 sm:gap-8 justify-between">
                    <div className="flex flex-row items-center gap-4 sm:gap-8">
                        <h1 className="text-3xl font-normal">
                            {"Playground"}
                        </h1>
                        <div className="flex flex-col gap-8 items-center justify-center">
                        <TranscriptProvider>
      <EventProvider>
        <App hasApiKey={hasApiKey} personalityIdState={personalityIdState} isDoctor={isDoctor} userId={currentUser.user_id} />
      </EventProvider>
    </TranscriptProvider>
                        </div>
                    </div>
                </div>

                <HomePageSubtitles
                    user={currentUser}
                    page="home"
                    languageCode={'en-US'}
                />
                    <div className="flex flex-col gap-2">
                        <PersonalityFilters
                            setSelectedFilters={setSelectedFilters}
                            selectedFilters={selectedFilters}
                            languageState={'en-US'}
                            currentUser={currentUser}
                        />
                        <PickPersonality
                            selectedFilters={selectedFilters}
                            onPersonalityPicked={onPersonalityPicked}
                            personalityIdState={personalityIdState}
                            currentUser={currentUser}
                            languageState={'en-US'}
                            disableButtons={false}
                            allPersonalities={isDoctor 
                                ? allPersonalities.filter(p => p.is_story || p.is_doctor)
                                : allPersonalities}                            
                            myPersonalities={myPersonalities}
                        />
                    </div>
            </div>
        </div>
    );
};

export default Playground;