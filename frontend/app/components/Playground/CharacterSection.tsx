import { EnglishCopy } from "@/utils/i18n";
import SheetWrapper from "./SheetWrapper";

interface CharacterSectionProps {
    allPersonalities: IPersonality[];
    languageState: string;
    personalityIdState: string;
    onPersonalityPicked: (personalityIdPicked: string) => void;
    title: EnglishCopy;
    disableButtons: boolean;
    selectedFilters: PersonalityFilter[];
}

const CharacterSection = ({
    allPersonalities,
    languageState,
    personalityIdState,
    onPersonalityPicked,
    title,
    disableButtons,
    selectedFilters,
}: CharacterSectionProps) => {
    const filteredPersonalities = allPersonalities.filter((personality) => {
        return selectedFilters.every((filter) => {
            return personality[filter] === true;
        });
    });

    if (filteredPersonalities.length === 0) {
        return (
            <div className="text-sm mt-4 text-gray-400">
                {"No characters found"}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 w-full">
            <p className="text-sm text-gray-600 self-start flex flex-row items-center gap-2">
                <span>{title}</span>
            </p>
            <div className="w-full">
                <div className="grid grid-cols-2 lg:grid-cols-4 md:gap-6 gap-4">
                    {filteredPersonalities.map((personality, index) => (
                        <SheetWrapper
                            languageState={languageState}
                            key={index + personality.personality_id}
                            personality={personality}
                            personalityIdState={personalityIdState}
                            onPersonalityPicked={onPersonalityPicked}
                            disableButtons={disableButtons}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CharacterSection;
