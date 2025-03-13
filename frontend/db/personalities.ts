import { SupabaseClient } from "@supabase/supabase-js";

export const getPersonalityById = async (supabase: SupabaseClient, personalityId: string) => {
    const { data, error } = await supabase
        .from("personalities")
        .select(`*`)
        .eq("personality_id", personalityId);

    if (error) {
        console.log("error getPersonalityById", error);
        return null;
    }

    return data[0] as IPersonality;
}

export const getAllPersonalities = async (supabase: SupabaseClient) => {
    const { data, error } = await supabase
        .from("personalities")
        .select(`*`)
        .is("creator_id", null)
        .order("created_at", { ascending: false });
       
    if (error) {
        console.log("error getAllPersonalities", error);
        return [];
    }

    return data as IPersonality[];
};

export const getMyPersonalities = async (supabase: SupabaseClient, userId: string) => {
    const { data, error } = await supabase
        .from("personalities")
        .select(`*`)
        .eq("creator_id", userId);
        
    if (error) {
        console.log("error getMyPersonalities", error);
        return [];
    }

    return data as IPersonality[];
};
