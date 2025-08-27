'use server';

/**
 * @fileOverview An AI agent to explain code snippets.
 *
 * - explainCodeSnippet - A function that handles the code explanation process.
 * - ExplainCodeSnippetInput - The input type for the explainCodeSnippet function.
 * - ExplainCodeSnippetOutput - The return type for the explainCodeSnippet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import cache from '@/services/cache';


const ExplainCodeSnippetInputSchema = z.object({
  codeSnippet: z
    .string()
    .describe('The code snippet to be explained.'),
});
export type ExplainCodeSnippetInput = z.infer<typeof ExplainCodeSnippetInputSchema>;

const ExplainCodeSnippetOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the code snippet.'),
});
export type ExplainCodeSnippetOutput = z.infer<typeof ExplainCodeSnippetOutputSchema>;

export async function explainCodeSnippet(input: ExplainCodeSnippetInput): Promise<ExplainCodeSnippetOutput> {
  const cacheKey = cache.hash(input);
  const cached = await cache.get<ExplainCodeSnippetOutput>(cacheKey);
  if (cached) {
    return cached;
  }
  
  const result = await explainCodeSnippetFlow(input);
  await cache.set(cacheKey, result);
  return result;
}

const prompt = ai.definePrompt({
  name: 'explainCodeSnippetPrompt',
  input: {schema: ExplainCodeSnippetInputSchema},
  output: {schema: ExplainCodeSnippetOutputSchema},
  prompt: `You are an expert software developer. Explain the following code snippet clearly and concisely:\n\n{{codeSnippet}}`,
});

const explainCodeSnippetFlow = ai.defineFlow(
  {
    name: 'explainCodeSnippetFlow',
    inputSchema: ExplainCodeSnippetInputSchema,
    outputSchema: ExplainCodeSnippetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
