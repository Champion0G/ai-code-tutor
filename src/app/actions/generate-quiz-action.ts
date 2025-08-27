
'use server';

import { generateQuiz } from "@/ai/flows/generate-quiz";
import type { GenerateQuizInput } from "@/ai/flows/generate-quiz";
import { safeError } from "@/lib/safe-error";

export async function generateQuizAction(input: GenerateQuizInput) {
    try {
        const quiz = await generateQuiz(input);
        return { success: true, quiz };
    } catch (err) {
        const safe = safeError(err);
        console.error("generateQuizAction error:", safe);
        return { success: false, message: safe.message };
    }
}

    