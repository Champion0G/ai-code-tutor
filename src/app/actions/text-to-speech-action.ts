
'use server';

import { textToSpeech } from "@/ai/flows/text-to-speech";
import { safeError } from "@/lib/safe-error";

export async function textToSpeechAction(text: string) {
    try {
        const result = await textToSpeech(text);
        return { success: true, audioDataUri: result.audioDataUri };
    } catch (err) {
        const safe = safeError(err);
        console.error("textToSpeechAction error:", safe);
        return { success: false, message: safe.message };
    }
}

    