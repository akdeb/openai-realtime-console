import { SupabaseClient } from "@supabase/supabase-js";

export const dbCheckUserCode = async (
    supabase: SupabaseClient,
    userCode: string
) => {
    const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("user_code", userCode)
        .maybeSingle();

    if (error) {
        throw error;
    }
    return !!data;
};

export const updateDevice = async (
    supabase: SupabaseClient,
    device: Partial<IDevice>,
    device_id: string
) => {
    const { error } = await supabase.from("devices").update(device).eq("device_id", device_id);
    if (error) {
        throw error;
    }
};

export const addUserToDevice = async (
    supabase: SupabaseClient,
    userCode: string,
    userId: string
) => {
    try {
        // Get device info first
        const { data: deviceData, error: fetchError } = await supabase
            .from("devices")
            .select("device_id")
            .eq("user_code", userCode)
            .single();

        if (fetchError || !deviceData) {
            console.error("Error fetching device:", fetchError);
            return false;
        }

        // Update device
        const { error: deviceError } = await supabase
            .from("devices")
            .update({ user_id: userId })
            .eq("device_id", deviceData.device_id);

        if (deviceError) {
            console.error("Error updating device:", deviceError);
            return false;
        }

        // Update user
        const { error: userError } = await supabase
            .from("users")
            .update({ device_id: deviceData.device_id })
            .eq("user_id", userId);

        if (userError) {
            console.error("Error updating user:", userError);
            
            // Rollback the device update
            await supabase
                .from("devices")
                .update({ user_id: null })
                .eq("device_id", deviceData.device_id);
                
            return false;
        }

        return true;
    } catch (error) {
        console.error("Unexpected error:", error);
        return false;
    }
};

export const doesUserHaveADevice = async (
    supabase: SupabaseClient,
    userId: string
) => {
    const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return !!data;
};
