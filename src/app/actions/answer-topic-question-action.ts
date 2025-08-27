
'use server';

import { answerTopicQuestion } from "@/ai/flows/answer-topic-question";
import { safeError } from "@/lib/safe-error";
import type { AnswerTopicQuestionInput, AnswerTopicQuestionOutput } from "@/ai/flows/answer-topic-question";


// Re-export the output type for the client
export type { AnswerTopicQuestionOutput }

export async function answerTopicQuestionAction(input: AnswerTopicQuestionInput) {
    try {
        const answer = await answerTopicQuestion(input);
        return { success: true, answer };
    } catch (err) {
        const safe = safeError(err);
        console.error("answerTopicQuestionAction error:", safe);
        return { success: false, message: safe.message };
    }
}
