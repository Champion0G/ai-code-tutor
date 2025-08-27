
'use server';

import { getFeedbackOnSummary } from "@/ai/flows/get-feedback-on-summary";
import type { GetFeedbackOnSummaryInput } from "@/ai/flows/get-feedback-on-summary";
import { safeError } from "@/lib/safe-error";

export async function getFeedbackOnSummaryAction(input: GetFeedbackOnSummaryInput) {
    try {
        const feedback = await getFeedbackOnSummary(input);
        return { success: true, feedback };
    } catch (err) {
        const safe = safeError(err);
        console.error("getFeedbackOnSummaryAction error:", safe);
        return { success: false, message: safe.message };
    }
}
