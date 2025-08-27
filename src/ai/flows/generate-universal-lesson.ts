
'use server';

/**
 * @fileOverview Generates a universal lesson based on a comprehensive teaching framework.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { UniversalLesson, UniversalLessonSchema } from '@/models/universal-lesson';


const GenerateUniversalLessonInputSchema = z.object({
  topic: z.string().describe('The topic the user wants to learn about.'),
  // In the future, we can add learnerProfile, learningStyle, etc.
});
export type GenerateUniversalLessonInput = z.infer<typeof GenerateUniversalLessonInputSchema>;


export async function generateUniversalLesson(
  input: GenerateUniversalLessonInput
): Promise<UniversalLesson> {
  return generateUniversalLessonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUniversalLessonPrompt',
  input: {schema: GenerateUniversalLessonInputSchema},
  output: {schema: UniversalLessonSchema},
  prompt: `You are a Universal AI Tutor. Your goal is to teach any topic to a user based on a sophisticated teaching framework.
The user wants to learn about: {{{topic}}}

Please generate a lesson plan based on this topic. Structure your response according to the provided JSON schema. Here is a brief overview of the key sections you must generate:

1.  **title**: A clear, engaging title for the lesson.
2.  **introduction**: Start with an Analogy to make the topic relatable.
3.  **stepByStep**: Break down the topic into 3-5 sequential, easy-to-understand steps. Each step should have a title and content.
4.  **deepDive**: Provide an advanced, academic explanation for learners who want to go deeper. This should include more technical details.
5.  **realWorldApplication**: Explain a practical use case for this knowledge.
6.  **summary**: A brief summary to reinforce the key points.

Keep the language simple and accessible for the introduction and step-by-step sections, but use more formal, academic language for the deep dive.
`,
});

const generateUniversalLessonFlow = ai.defineFlow(
  {
    name: 'generateUniversalLessonFlow',
    inputSchema: GenerateUniversalLessonInputSchema,
    outputSchema: UniversalLessonSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output! as UniversalLesson;
  }
);
