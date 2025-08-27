
'use server';

import { adaptiveAnswerQuestion } from "@/ai/flows/adaptive-answer-question";
import type { AdaptiveAnswerQuestionInput, AdaptiveAnswerQuestionOutput } from "@/ai/flows/adaptive-answer-question";
import { safeError } from "@/lib/safe-error";

// Re-export the output type for the client
export type { AdaptiveAnswerQuestionOutput as AnswerTopicQuestionOutput }

export async function answerTopicQuestion(input: AdaptiveAnswerQuestionInput) {
    try {
        const answer = await adaptiveAnswerQuestion(input);
        return { success: true, answer };
    } catch (err) {
        const safe = safeError(err);
        console.error("answerTopicQuestionAction error:", safe);
        return { success: false, message: safe.message };
    }
}

    