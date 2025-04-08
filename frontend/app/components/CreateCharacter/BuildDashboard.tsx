"use client";

import React, { useState } from "react";
import { updateUser } from "@/db/users";
import { createClient } from "@/utils/supabase/client";
import HomePageSubtitles from "./../HomePageSubtitles";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, Mic, Volume2 } from "lucide-react";
import Twemoji from "react-twemoji";
import { createPersonality } from "../../actions";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { emotionOptions, r2UrlAudio, voices } from "@/lib/data";
import EmojiComponent from "./EmojiComponent";

interface SettingsDashboardProps {
    selectedUser: IUser;
    allLanguages: ILanguage[];
}

const formSchema = z.object({
  title: z.string().min(2, "Minimum 2 characters").max(50, "Maximum 50 characters"),
  description: z.string().min(50, "Minimum 50 characters").max(200, "Maximum 200 characters"),
  prompt: z.string().min(100, "Minimum 100 characters").max(1000, "Maximum 1000 characters"),
  voice: z.string().min(1, "Voice selection is required"),
  voiceCharacteristics: z.object({
    features: z.string().min(10, "Minimum 10 characters").max(150, "Maximum 150 characters"),
    emotion: z.string()
  })
});

type FormData = z.infer<typeof formSchema>;

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({
    selectedUser,
    allLanguages,
}) => {
    const supabase = createClient();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<'personality' | 'voice'>('personality');
    const [isSubmitting, setIsSubmitting] = useState(false);


    const [languageState, setLanguageState] = useState<string>(
        selectedUser.language_code! // Initial value from props
    );

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        prompt: '',
        voice: '',
        voiceCharacteristics: {
          features: '',
          emotion: 'neutral'
        }
      });

      const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});


      const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData | 'features', string>>>({});

      
      const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
    
      const handleBlur = (field: keyof FormData | 'features') => {
        // Mark the field as touched
        setTouchedFields(prev => ({ ...prev, [field]: true }));
        
        // Validate the field
        if (field === 'features') {
          validateField(field, formData.voiceCharacteristics.features);
        } else {
          validateField(field, formData[field] as string);
        }
      };
      
      const validateField = (field: keyof FormData | 'features', value: string) => {
        try {
          if (field === 'features') {
            formSchema.shape.voiceCharacteristics.shape.features.parse(value);
          } else if (field === 'voiceCharacteristics') {
            formSchema.shape.voiceCharacteristics.parse(value);
          } else {
            formSchema.shape[field].parse(value);
          }
          // Clear error if validation passes
          setFormErrors(prev => ({ ...prev, [field]: undefined }));
        } catch (error: unknown) {
          if (error instanceof z.ZodError) {
            const zodError = error as z.ZodError;
            setFormErrors(prev => ({ ...prev, [field]: zodError.errors[0].message }));
          }
        }
      };

      const handleInputChange = (field: keyof FormData, value: string) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);
        
        // Only validate if the field has been touched before
        if (touchedFields[field]) {
          validateField(field, value);
        }
      };
    
    const handleVoiceCharacteristicChange = (characteristic: 'features' | 'emotion', value: string) => {
      const newVoiceCharacteristics = {
        ...formData.voiceCharacteristics,
        [characteristic]: value
      };
      
      // Validate just this nested field
      try {
        formSchema.shape.voiceCharacteristics.shape[characteristic].parse(value);
        // Clear error if validation passes
        setFormErrors(prev => ({ ...prev, [characteristic]: undefined }));
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          // Type assertion is needed here
          const zodError = error as z.ZodError;
          setFormErrors(prev => ({ ...prev, [characteristic]: zodError.errors[0].message }));
        }
      }
      
      setFormData({
        ...formData,
        voiceCharacteristics: newVoiceCharacteristics
      });
  };
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Set submitting state to true
    setIsSubmitting(true);
    
    // Validate the entire form
    const result = formSchema.safeParse(formData);
    console.log(result);
    
    if (!result.success) {
      // Extract and set all validation errors
      const errors: Partial<Record<keyof FormData | 'features', string>> = {};
      result.error.errors.forEach(err => {
        const path = err.path.join('.');
        if (path === 'voiceCharacteristics.features') {
          errors['features'] = err.message;
        } else {
          errors[err.path[0] as keyof FormData] = err.message;
        }
      });
      setFormErrors(errors);
      setIsSubmitting(false); // Reset submitting state
      return;
    }

    try {
      const personality = await createPersonality(selectedUser.user_id, {
        title: formData.title,
        subtitle: "",
        character_prompt: formData.prompt,
        oai_voice: formData.voice as OaiVoice,
        voice_prompt: formData.voiceCharacteristics.features + "\nThe voice should be " + formData.voiceCharacteristics.emotion,
        is_doctor: false,
        is_child_voice: false,
        is_story: false,
        key: formData.title.toLowerCase().replace(/ /g, '_') + "_" + uuidv4(),
        creator_id: selectedUser.user_id,
        short_description: formData.description
      });

      if (personality) {
        toast({
          title: "New AI Character created",
          description: "Your character has been created!",
          duration: 3000,
        });
        router.push(`/home`);
      }
    } catch (error) {
      console.error("Error creating personality:", error);
      toast({
        title: "Error",
        description: "Failed to create your character. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
};

      const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    
      const previewVoice = (voiceId: string) => {
        // Stop any currently playing preview
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
        
        const audioSampleUrl = `${r2UrlAudio}/${voiceId}.wav`;
        setPreviewingVoice(voiceId);
        
        // Create and play audio element
        const audio = new Audio(audioSampleUrl);
        setAudioElement(audio);
        
        // Play the audio
        audio.play().catch(error => {
          console.error("Error playing audio:", error);
          setPreviewingVoice(null);
        });
        
        // Reset the previewing state when audio ends
        audio.onended = () => {
          setPreviewingVoice(null);
        };
        
        // Fallback in case audio doesn't trigger onended
        setTimeout(() => {
          if (previewingVoice === voiceId) {
            setPreviewingVoice(null);
          }
        }, 10000); // 10 second fallback
      };

    const Heading = () => {
        return (
            <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-4 items-center sm:justify-normal justify-between max-w-screen-sm">
                    <div className="flex flex-row gap-4 items-center justify-between w-full">
                        <h1 className="text-3xl font-normal">Create your AI Character</h1>
                    </div>
                </div>
                <HomePageSubtitles user={selectedUser} page="create" />
            </div>
        );
    };

    return (
        <div className="overflow-hidden pb-2 w-full flex-auto flex flex-col pl-1 max-w-screen-sm">
            <Heading />
            <form onSubmit={handleSubmit} className="space-y-6 mt-8 w-full pr-1">
          
            {currentStep === 'personality' ? <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b border-gray-200 pb-2">
                        Character Details
                    </h2>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                placeholder="E.g., 'Storytelling Assistant'" 
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                              />
              <p className="text-sm flex justify-between">
    <span className={formErrors.title ? "text-red-500" : "text-gray-500"}>
      {formErrors.title || "Give your AI character a name or title."}
    </span>
    <span className="text-gray-500">{formData.title.length}/50</span>
  </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                placeholder="Describe what your AI character does and its personality..." 
                rows={2}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onBlur={() => handleBlur('description')}              />
              <p className="text-sm flex justify-between">
    <span className={formErrors.description ? "text-red-500" : "text-gray-500"}>
      {formErrors.description || "Briefly describe your character's purpose and personality."}
    </span>
    <span className="text-gray-500">{formData.description.length}/200</span>
  </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea 
                id="prompt"
                placeholder="Enter specific instructions for how your AI should respond..." 
                rows={4}
                value={formData.prompt}
                onChange={(e) => handleInputChange('prompt', e.target.value)}
                onBlur={() => handleBlur('prompt')} 
                             />
              <p className="text-sm flex justify-between">
    <span className={formErrors.prompt ? "text-red-500" : "text-gray-500"}>
      {formErrors.prompt || "Detailed instructions that define how your AI responds to users."}
    </span>
    <span className="text-gray-500">{formData.prompt.length}/1000</span>
  </p>
            </div>
            </div> :
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b border-gray-200 pb-2">
                        Voice Details
                    </h2>
            <div className="space-y-2">
              <Label htmlFor="voice">Pick a voice</Label>
              <p className="text-sm text-gray-500">
                Click a voice to preview how it sounds. Select one for your character.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {voices.map((voice) => (
                  <div 
                  key={voice.id}
                  className={`
                    rounded-lg border p-3 transition-all relative
                    ${formData.voice === voice.id 
                      ? 'border-2 border-blue-500 shadow-sm ' + voice.color 
                      : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                    }
                  `}
                  onClick={() => {
                    handleInputChange('voice', voice.id);
                    previewVoice(voice.id);
                  }}
                >
                  <div className="flex flex-col">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                      <div className="text-2xl mt-0.5">
                        <EmojiComponent emoji={voice.emoji} />
                      </div>
                      <div className="flex flex-col text-center sm:text-left">
                        <span className="font-medium">{voice.name}</span>
                        <span className="text-xs text-gray-600">{voice.description}</span>
                      </div>
                    </div>
                    
                    {previewingVoice === voice.id && (
  <div className="absolute top-2 right-2">
    <div className="animate-pulse text-blue-500">
      <Volume2 size={20} />
    </div>
  </div>
)}
                  </div>
                </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
                  <Label htmlFor="voiceCharacteristics">Characteristics</Label>
                  <Textarea 
  id="voiceCharacteristics"
  placeholder="e.g., Medium pitch, Normal speed, Clear voice" 
  className="w-full min-h-16"
  rows={2}
  value={formData.voiceCharacteristics.features}
  onChange={(e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      voiceCharacteristics: {
        ...prev.voiceCharacteristics,
        features: value
      }
    }));
    // Only validate if touched
    if (touchedFields['features']) {
      validateField('features', value);
    }
  }}
  onBlur={() => handleBlur('features')}
/>
<p className="text-sm flex justify-between">
    <span className={formErrors.features ? "text-red-500" : "text-gray-500"}>
      {formErrors.features || "Describe the voice characteristics."}
    </span>
    <span className="text-gray-500">{formData.voiceCharacteristics.features.length}/150</span>
  </p>
            </div>
                <div className="space-y-3">
                  <Label className="block mb-2">Emotional Tone</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {emotionOptions.map((emotion) => (
                      <div 
                        key={emotion.value}
                        className={`
                          rounded-lg border p-3 cursor-pointer transition-all
                          ${formData.voiceCharacteristics.emotion === emotion.value 
                            ? 'border-2 border-blue-500 shadow-sm ' + emotion.color 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                        onClick={() => handleVoiceCharacteristicChange('emotion', emotion.value)}
                      >
                        <div className="flex flex-col items-center text-center">
                          <EmojiComponent emoji={emotion.icon} />
                          <span className="text-sm font-medium">{emotion.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>}
           
           
            {currentStep === 'personality' ? (
          <Button 
            onClick={() => setCurrentStep('voice')}
            className="ml-auto flex flex-row gap-2 items-center"
          >
            Add Voice Features <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
            <div className="w-full flex justify-between">
            <Button 
              variant="outline" 
              className="flex flex-row gap-2 items-center"
              onClick={() => setCurrentStep('personality')}
            >
              <ArrowLeft className="w-4 h-4" /> Back 
            </Button>
            <Button 
      variant="default"
      className="flex flex-row gap-2 items-center"
      type="submit"
      disabled={
        isSubmitting || 
        formData.title === '' || 
        formData.description === '' || 
        formData.prompt === '' || 
        formData.voice === '' || 
        formData.voiceCharacteristics.features === ''
      }
    >
      {isSubmitting ? "Creating..." : "Create"} {!isSubmitting && <Check className="w-4 h-4" />}
    </Button>
          </div>
        )}
        </form>
        </div>
    );
};

export default SettingsDashboard;