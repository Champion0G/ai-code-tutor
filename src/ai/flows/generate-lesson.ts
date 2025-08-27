
'use server';

/**
 * @fileOverview Generates a lesson on a given topic.
 *
 * - generateLesson - A function that handles the lesson generation process.
 * - GenerateLessonInput - The input type for the generateLesson function.
 * - GenerateLessonOutput - The return type for the generateLesson function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateLessonOutputSchema, GenerateLessonOutput } from './explain-topic-further';


const GenerateLessonInputSchema = z.object({
  topic: z.string().describe('The topic the user wants to learn about.'),
});
export type GenerateLessonInput = z.infer<typeof GenerateLessonInputSchema>;


export async function generateLesson(
  input: GenerateLessonInput
): Promise<GenerateLessonOutput> {
  return generateLessonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonPrompt',
  input: {schema: GenerateLessonInputSchema},
  output: {schema: GenerateLessonOutputSchema},
  prompt: `You are an expert programming tutor. Your goal is to teach a programming concept to a user in a clear, concise, and structured way.

The user wants to learn about: {{{topic}}}

Please generate a lesson with the following structure:
1.  A clear title for the lesson.
2.  A brief introduction that explains what the topic is and why it's important.
3.  A list of 2-4 key concepts. For each concept, provide:
    a. A title.
    b. A simple explanation.
    c. A relevant code example to demonstrate the concept.
    d. A brief explanation of the code example.
4.  A concluding summary that recaps the main points.

Keep the language simple and accessible, assuming the user might be a beginner. Avoid overly technical jargon where possible.
`,
});

const generateLessonFlow = ai.defineFlow(
  {
    name: 'generateLessonFlow',
    inputSchema: GenerateLessonInputSchema,
    outputSchema: GenerateLessonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output! as GenerateLessonOutput;
  }
);
