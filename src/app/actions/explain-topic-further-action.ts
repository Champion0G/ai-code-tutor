
'use server';

import { explainTopicFurther } from "@/ai/flows/explain-topic-further";
import type { ExplainTopicFurtherInput } from "@/ai/flows/explain-topic-further";
import { safeError } from "@/lib/safe-error";

export async function explainTopicFurtherAction(input: ExplainTopicFurtherInput) {
    try {
        const result = await explainTopicFurther(input);
        return { success: true, explanation: result };
    } catch (err) {
        const safe = safeError(err);
        console.error("explainTopicFurtherAction error:", safe);
        return { success: false, message: safe.message };
    }
}
