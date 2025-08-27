
'use server';

import { generateVisualAid } from "@/ai/flows/generate-visual-aid";
import type { GenerateVisualAidInput } from "@/ai/flows/generate-visual-aid";
import { safeError } from "@/lib/safe-error";

export async function generateVisualAidAction(input: GenerateVisualAidInput) {
    try {
        const result = await generateVisualAid(input);
        return { success: true, imageUrl: result.imageUrl };
    } catch (err) {
        const safe = safeError(err);
        console.error("generateVisualAidAction error:", safe);
        return { success: false, message: safe.message };
    }
}

    