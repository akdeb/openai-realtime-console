export const defaultToyId: string = "56224f7f-250d-4351-84ee-e4a13b881c7b";
export const defaultPersonalityId: string =
    "a1c073e6-653d-40cf-acc1-891331689409";

export const paymentLink = "https://buy.stripe.com/5kAaG6alo1mo0Tu28a";
export const starmoonProductsLink = "https://elatoai.com/products";
export const discordInviteLink = "https://discord.gg/KJWxDPBRUj";
export const tiktokLink = "https://www.tiktok.com/@elatoai";
export const githubPublicLink = "https://github.com/StarmoonAI/Starmoon";
export const businessDemoLink = "https://calendly.com/akadeb/elato-ai-demo";
export const feedbackFormLink = "https://forms.gle/2QmukEG2FXNwBdee7";

export const r2Url = "https://pub-cd736d767add4fecafea55c239c28497.r2.dev";
export const r2UrlAudio = "https://pub-5fab8e2596c544cd8dc3e20812be2168.r2.dev";

export const videoSrc = `${r2Url}/IMG_1673.mov`;
export const videoSrc2 = `${r2Url}/IMG_1675.mov`;
export const videoSrc3 = `${r2Url}/IMG_1676.mov`;
export const videoSrc4 = `${r2Url}/IMG_1677.mov`;

export const voiceSampleUrl =
    "https://xygbupeczfhwamhqnucy.supabase.co/storage/v1/object/public/voices/";
export const docsLink = "https://starmoonai.notion.site/doc?pvs=4";

export const userFormPersonaLabel =
    "Briefly describe yourself and your interests, personality, and learning style";
export const userFormPersonaPlaceholder =
    "Don't get me started on the guitar...I love to shred it like Hendrix. I also like a good challenge. Challenge me to be better and I'll rise to the occasion.";
export const userFormAgeLabel = "Your Age";
export const userFormAgeDescription =
    "Users under 13 years old must have a parent or guardian to setup Elato.";
export const userFormNameLabel = "Your Name";

export const INITIAL_CREDITS = 50;
export const SECONDS_PER_CREDIT = (30 * 60) / INITIAL_CREDITS; // 30 minutes equals 50 credits

export const DEVICE_COST = 69;
export const ORIGINAL_COST = 111;
export const SUBSCRIPTION_COST = 10;

export const voices = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced', color: 'bg-blue-100', emoji: '🧑' },
  { id: 'echo', name: 'Echo', description: 'Warm and melodic', color: 'bg-purple-100', emoji: '👩‍🎤' },
  { id: 'shimmer', name: 'Shimmer', description: 'Clear and bright', color: 'bg-cyan-100', emoji: '👱‍♀️' },
  { id: 'ash', name: 'Ash', description: 'Soft and thoughtful', color: 'bg-gray-100', emoji: '🧔' },
  { id: 'ballad', name: 'Ballad', description: 'Melodic and emotive', color: 'bg-indigo-100', emoji: '🎭' },
  { id: 'coral', name: 'Coral', description: 'Warm and friendly', color: 'bg-orange-100', emoji: '👩' },
  { id: 'sage', name: 'Sage', description: 'Wise and measured', color: 'bg-green-100', emoji: '🧓' },
  { id: 'verse', name: 'Verse', description: 'Poetic and expressive', color: 'bg-rose-100', emoji: '👨‍🎨' }
];

export const emotionOptions = [
  { value: 'neutral', label: 'Neutral', icon: '😐', color: 'bg-red-100' },
  { value: 'cheerful', label: 'Cheerful', icon: '😊', color: 'bg-yellow-100' },
  { value: 'serious', label: 'Serious', icon: '🧐', color: 'bg-blue-100' },
  { value: 'calm', label: 'Calm', icon: '😌', color: 'bg-teal-100' },
  { value: 'excited', label: 'Excited', icon: '😃', color: 'bg-orange-100' },
  { value: 'professional', label: 'Professional', icon: '👔', color: 'bg-green-100' }
];
