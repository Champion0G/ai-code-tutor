
'use server';

import { generateAdaptiveQuiz } from "@/ai/flows/generate-adaptive-quiz";
import { safeError } from "@/lib/safe-error";
import type { GenerateAdaptiveQuizInput } from "@/models/adaptive-quiz";


export async function generateAdaptiveQuizAction(input: GenerateAdaptiveQuizInput) {
    try {
        const quiz = await generateAdaptiveQuiz(input);
        return { success: true, quiz };
    } catch (err) {
        const safe = safeError(err);
        console.error("generateAdaptiveQuizAction error:", safe);
        return { success: false, message: safe.message };
    }
}
