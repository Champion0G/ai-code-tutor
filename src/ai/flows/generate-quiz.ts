'use server';

/**
 * @fileOverview Generates a quiz based on the content of a file.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import cache from '@/services/cache';

const GenerateQuizInputSchema = z.object({
  fileContent: z.string().describe('The content of the file to generate a quiz from.'),
  fileName: z.string().describe('The name of the file.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The quiz question.'),
  options: z.array(z.string()).describe('An array of 4 possible answers.'),
  correctAnswer: z.string().describe('The correct answer from the options.'),
});

const GenerateQuizOutputSchema = z.object({
    title: z.string().describe('The title of the quiz.'),
    questions: z.array(QuizQuestionSchema).describe('An array of quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  // To keep quizzes fresh, we add a random salt to the cache key.
  // This means quizzes are not cached unless the user regenerates one very quickly.
  const cacheKey = cache.hash({...input, salt: Math.random() });
  const cached = await cache.get<GenerateQuizOutput>(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await generateQuizFlow(input);
  // We don't cache quiz results to ensure they are fresh each time.
  // await cache.set(cacheKey, result);
  return result;
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an AI assistant that generates a multiple-choice quiz based on the provided file content.

Create a quiz with a title and a few questions to test the user's understanding of the file.
Each question should have 4 options, and one correct answer.

IMPORTANT: Each time you generate a quiz for the same file, try to create a different set of questions to keep it fresh and challenging.

File Name: {{{fileName}}}
File Content:
\`\`\`
{{{fileContent}}}
\`\`\`
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
