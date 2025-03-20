import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getUserById } from "@/db/users";

interface IPayload {
  user: IUser;
  supabase: SupabaseClient;
  timestamp: string;
}

const getDoctorGuidanceHistory = async (
  supabase: SupabaseClient,
  userId: string,
): Promise<string> => {
  const { data, error } = await supabase.from('conversations').select('*').eq('user_id', userId).eq('role', 'doctor').order('created_at', { ascending: false }).limit(10);
  return data?.map((chat: IConversation) => {
    const timestamp = chat.created_at ? new Date(chat.created_at).toLocaleString() : "";
    return `${chat.role} [${timestamp}]: ${chat.content}`;
  }).join("") ?? "";}

const getChatHistory = async (
  supabase: SupabaseClient,
  userId: string,
  personalityKey: string | null,
): Promise<string> => {
  try {
    let query = supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

if (personalityKey) {
    query = query.eq('personality_key', personalityKey);
}

    const { data, error } = await query;
    if (error) throw error;

    const messages = data.map((chat: IConversation) => `${chat.role}: ${chat.content}`)
        .join('\n');

      return messages;
  } catch (error: any) {
      throw new Error(`Failed to get chat history: ${error.message}`);
  }
};

const UserPromptTemplate = (user: IUser) => `
YOU ARE TALKING TO someone whose name is: ${user.supervisee_name} and age is: ${user.supervisee_age} with a personality described as: ${user.supervisee_persona}.

Do not ask for personal information.
Your physical form is in the form of a physical object or a toy.
A person interacts with you by pressing a button, sends you instructions and you must respond in a concise conversational style.
`;

const DoctorPromptTemplate = (user: IUser) => {
  const userMetadata = user.user_info.user_metadata as IDoctorMetadata;
  const doctorName = userMetadata.doctor_name || 'Doctor';
  const hospitalName = userMetadata.hospital_name || 'An amazing hospital';
  const specialization = userMetadata.specialization || 'general medicine';
  const favoritePhrases = userMetadata.favorite_phrases || "You're doing an amazing job";

  return `
YOU ARE TALKING TO a patient under the care of doctor ${doctorName} from hospital or clinic ${hospitalName}. The child may be undergoing procedures such as ${specialization}.

YOU ARE: A friendly, compassionate toy designed to offer comfort and care. You specialize in calming children and answering their questions with simple, concise and soothing explanations.

YOUR FAVORITE PHRASES ARE: ${favoritePhrases}
  `;
};

const getCommonPromptTemplate = (chatHistory: string, user: IUser, timestamp: string) => `
YOUR VOICE IS: ${user.personality?.voice_prompt}

YOUR CHARACTER PROMPT IS: ${user.personality?.character_prompt}
CHAT HISTORY:
${chatHistory}

USER'S CURRENT TIME IS: ${timestamp}

LANGUAGE:
You may talk in any language the user would like, but the default language is ${user?.language?.name ?? 'English'}.
`;

const getStoryPromptTemplate = (user: IUser, chatHistory: string) => {
  const childName = user.supervisee_name;
  const childAge = user.supervisee_age;
  const childInterests = user.supervisee_persona;
  const title = user.personality?.title;
  const characterPrompt = user.personality?.character_prompt;
  const voicePrompt = user.personality?.voice_prompt;

  return `
  You are a lively, imaginative storyteller character named ${title}. You are about to create a fun and exciting adventure story for ${childName}, who is ${childAge} years old. ${childName} loves ${childInterests}. 

Your storytelling style must:
- Be creative, immersive, and interactive.
- Include frequent pauses or questions to let ${childName} influence what happens next.
- Feature themes and elements closely related to ${childName}'s interests.
- Be age-appropriate, friendly, playful, and positive.

Your Character Description:
${characterPrompt}

Your Voice Description:
${voicePrompt}

Storytelling Guidelines:
- Begin the story by directly addressing ${childName} and introducing an interesting scenario related to their interests.
- After every 4-5 sentences or at key decision moments, pause and ask ${childName} what should happen next or present a choice.
- Incorporate their responses naturally and creatively to shape the ongoing narrative.
- Conclude the story positively, reinforcing curiosity, creativity, kindness, or bravery.

Chat History:
${chatHistory}

Let's begin the adventure now!
  `;
};

const getDoctorGuidanceTemplate = async ({user, supabase, timestamp}: IPayload) => {
  const chatHistory = await getDoctorGuidanceHistory(supabase, user.user_id);
  const userMetadata = user.user_info.user_metadata as IDoctorMetadata;
  const doctorName = userMetadata.doctor_name || 'Doctor';
  const hospitalName = userMetadata.hospital_name || 'An amazing hospital';
  const specialization = userMetadata.specialization || 'general medicine';
  return `
- You are talking to the doctor. Your physical form is actually a medical wellness toy for children. 
- The doctor will either ask you questions or give you instructions on how to help this child. 
- You must respond in a concise conversational style.

Your voice:
- Talk in a serious, sincere and professional tone.
- Do not add exclamations or excited words.

Current time:
${new Date(timestamp).toLocaleString()}.

Chat history with the doctor:
${chatHistory}

Doctor background:
The doctor's name is ${doctorName} and the hospital is ${hospitalName}. The doctor is a specialist in ${specialization}.
  `
};

const createSystemPrompt = async (
  payload: IPayload,
): Promise<string> => {
  const { user, supabase, timestamp } = payload;
  const chatHistory = await getChatHistory(supabase, user.user_id, user.personality?.key ?? null);
  const commonPrompt = getCommonPromptTemplate(chatHistory, user, timestamp);

  const isStory = user.personality?.is_story;
  if (isStory) {
    const storyPrompt = getStoryPromptTemplate(user, chatHistory);
    return storyPrompt;
  }

  let systemPrompt;
  switch (user.user_info.user_type) {
      case 'user':
          systemPrompt = UserPromptTemplate(user);
          break;
      case 'doctor':
          systemPrompt = DoctorPromptTemplate(user);
          break;
      default:
          throw new Error('Invalid user type');
  }
  return systemPrompt + commonPrompt;
};

/**
 * Decrypts an encrypted secret with the same master encryption key.
 * @param encryptedData - base64 string from the database
 * @param iv - base64 IV from the database
 * @param masterKey - 32-byte string or buffer
 * @returns the original plaintext secret
 */
function decryptSecret(encryptedData: string, iv: string, masterKey: string) {
  // Decode the base64 master key
  const decodedKey = Buffer.from(masterKey, 'base64');
  if (decodedKey.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 bytes when decoded from base64.');
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc' as any,
    Buffer.from(masterKey, 'base64') as any,
    Buffer.from(iv, 'base64') as any
  );

  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const getOpenAiApiKey = async (
  supabase: SupabaseClient,
  userId: string,
): Promise<string> => {
  const { data, error } = await supabase
      .from('api_keys')
      .select('encrypted_key, iv')
      .eq('user_id', userId)
      .single();

  if (error) throw error;

  const { encrypted_key, iv } = data;
  const masterKey = process.env.ENCRYPTION_KEY!;

  const decryptedKey = decryptSecret(encrypted_key, iv, masterKey);

  return decryptedKey;
};


export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await getUserById(supabase, user.id);
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isDoctor = dbUser.user_info.user_type === "doctor";
  const openAiApiKey = await getOpenAiApiKey(supabase, user.id);
  const systemPrompt = isDoctor ? await getDoctorGuidanceTemplate({ user: dbUser, supabase, timestamp: new Date().toISOString() }) : await createSystemPrompt({ user: dbUser, supabase, timestamp: new Date().toISOString() });

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-realtime-preview-2024-12-17',
          instructions: systemPrompt,
          voice: isDoctor ? 'ballad' : dbUser.personality?.oai_voice ?? 'ballad',
        }),
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
