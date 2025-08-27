
'use server';

/**
 * @fileOverview Generates a universal lesson based on a comprehensive teaching framework.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { UniversalLesson, UniversalLessonSchema } from '@/models/universal-lesson';


const GenerateUniversalLessonInputSchema = z.object({
  topic: z.string().describe('The topic the user wants to learn about.'),
  knowledgeLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner').describe('The user\'s knowledge level to tailor the lesson.'),
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
The user's knowledge level is: {{{knowledgeLevel}}}

Please generate a lesson plan based on this topic and knowledge level. Structure your response according to the provided JSON schema. Here is a brief overview of the key sections you must generate:

1.  **title**: A clear, engaging title for the lesson.
2.  **introduction**: Start with an Analogy. Adjust the complexity for the user's knowledge level.
3.  **stepByStep**: Break down the topic into 3-5 sequential steps.
4.  **deepDive**: Provide an advanced, academic explanation.
5.  **narrative**: Create a story to explain the topic. Give it a title, the story itself, and a concluding 'moral' or takeaway. This is crucial for engagement.
6.  **realWorldApplication**: Explain a practical use case.
7.  **summary**: A brief summary to reinforce the key points.
8.  **knowledgeLevel**: Echo back the knowledge level this lesson was generated for.

Keep the language simple for beginners, and more academic for advanced users. The narrative should be creative and relevant.
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
