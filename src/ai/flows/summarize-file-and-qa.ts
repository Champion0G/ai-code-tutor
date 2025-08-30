'use server';
/**
 * @fileOverview An AI agent that answers questions about file content.
 *
 * - answerFileQuestion - A function that handles answering a question about a file.
 * - AnswerFileQuestionInput - The input type for the answerFileQuestion function.
 * - AnswerFileQuestionOutput - The return type for the answerFileQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import cache from '@/services/cache';

const AnswerFileQuestionInputSchema = z.object({
  context: z
    .string()
    .describe('The content of the file or repository summary to use as context.'),
  question: z.string().describe('The question to ask about the file content.'),
});
export type AnswerFileQuestionInput = z.infer<typeof AnswerFileQuestionInputSchema>;

const AnswerFileQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the file content.'),
});
export type AnswerFileQuestionOutput = z.infer<typeof AnswerFileQuestionOutputSchema>;

// This function was previously summarizeFileAndQA, but we are simplifying it
// to better support a conversational Q&A flow.
export async function answerFileQuestion(input: AnswerFileQuestionInput): Promise<AnswerFileQuestionOutput> {
  // Use a more specific cache key that includes the question
  const cacheKey = cache.hash(input);
  const cached = await cache.get<AnswerFileQuestionOutput>(cacheKey);
  if (cached) {
    return cached;
  }
  
  const result = await answerFileQuestionFlow(input);
  await cache.set(cacheKey, result);
  return result;
}

const prompt = ai.definePrompt({
  name: 'answerFileQuestionPrompt',
  input: {schema: AnswerFileQuestionInputSchema},
  output: {schema: AnswerFileQuestionOutputSchema},
  prompt: `You are an AI assistant that answers questions about a given context, which could be file content or a repository summary.

  Context:
  ---
  {{{context}}}
  ---

  Based on the context above, answer the following question.

  Question: {{{question}}}

  Provide a clear and concise answer in the 'answer' field.`,
});

const answerFileQuestionFlow = ai.defineFlow(
  {
    name: 'answerFileQuestionFlow',
    inputSchema: AnswerFileQuestionInputSchema,
    outputSchema: AnswerFileQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
