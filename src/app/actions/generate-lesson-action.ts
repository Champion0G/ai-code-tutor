
'use server';

import { generateUniversalLesson } from "@/ai/flows/generate-universal-lesson";
import type { GenerateUniversalLessonInput } from "@/ai/flows/generate-universal-lesson";
import { safeError } from "@/lib/safe-error";

export async function generateLessonAction(input: GenerateUniversalLessonInput) {
    try {
        const lesson = await generateUniversalLesson(input);
        return { success: true, lesson };
    } catch (err) {
        const safe = safeError(err);
        console.error("generateLessonAction error:", safe);
        return { success: false, message: safe.message };
    }
}

    