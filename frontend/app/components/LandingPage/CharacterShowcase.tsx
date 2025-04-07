'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import SheetWrapper from '../Playground/SheetWrapper';

// Example character data - replace with your actual data
const characters = [
  { id: 1, name: 'Assistant', description: 'Helpful AI assistant', image: '/characters/assistant.png' },
  { id: 2, name: 'Storyteller', description: 'Creative storytelling companion', image: '/characters/storyteller.png' },
  { id: 3, name: 'Tutor', description: 'Patient educational guide', image: '/characters/tutor.png' },
  { id: 4, name: 'Comedian', description: 'Witty joke-telling friend', image: '/characters/comedian.png' },
  { id: 5, name: 'Chef', description: 'Culinary expert and recipe advisor', image: '/characters/chef.png' },
  { id: 6, name: 'Fitness Coach', description: 'Motivational exercise companion', image: '/characters/fitness.png' },
  // Add more characters as needed
];

interface CharacterShowcaseProps {
  allPersonalities: IPersonality[];
}

export const CharacterShowcase = ({ allPersonalities }: CharacterShowcaseProps) => {
  const [hoveredCharacter, setHoveredCharacter] = useState<number | null>(null);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-screen-lg">
        <div className="flex flex-col lg:flex-row items-center gap-12">
         {/* Character List - On left for desktop, bottom for mobile */}
		 <div className="order-2 lg:order-1 w-full lg:w-3/5 sm:max-w-[400px] mx-auto">
     <div className="relative">
    {/* Top scroll indicator/halo */}
    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-50 to-transparent z-10 pointer-events-none rounded-t-lg"></div>
    
    <div className="h-[500px] mx-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-lg">
      <div className="grid grid-cols-2 gap-4 md:gap-6 p-4">
        {allPersonalities.map((personality, index) => (
          <SheetWrapper
            languageState={'en-US'}
            key={index + personality.personality_id!}
            personality={personality}
            personalityIdState={''}
            onPersonalityPicked={() => {}}
            disableButtons={true}
          />
        ))}
      </div>
    </div>
    
    {/* Bottom scroll indicator/halo */}
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent z-10 pointer-events-none rounded-b-lg"></div>
  </div>
          </div>

          {/* Text Content - On right for desktop, top for mobile */}
          <div className="order-1 lg:order-2 w-full lg:w-2/5">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
              Meet Our AI Characters
            </h2>
			<p className="text-lg text-gray-600 mb-6">
              Each character comes with specialized knowledge, voice and personality to make 
              your interactions more engaging.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-2">Personalized Experience</h3>
              <p className="text-blue-700">
                Choose the character that best fits your needs or mood. You can switch between 
                characters anytime during your conversation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};