'use server';

/**
 * @fileOverview Provides AI-powered suggestions for improving code snippets based on best practices and user-specified knowledge level.
 *
 * - suggestCodeImprovements - A function that handles the code improvement suggestion process.
 * - SuggestCodeImprovementsInput - The input type for the suggestCodeImprovements function.
 * - SuggestCodeImprovementsOutput - The return type for the suggestCodeImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import cache from '@/services/cache';

const SuggestCodeImprovementsInputSchema = z.object({
  codeSnippet: z
    .string()
    .describe('The code snippet to be improved.'),
  knowledgeLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The user\s knowledge level to tailor the suggestions.'),
  programmingLanguage: z
    .string()
    .optional()
    .describe('The programming language of the code snippet.'),
});

export type SuggestCodeImprovementsInput = z.infer<
  typeof SuggestCodeImprovementsInputSchema
>;

const SuggestCodeImprovementsOutputSchema = z.object({
  improvedCode: z
    .string()
    .describe('The improved code snippet with suggestions applied.'),
  explanation: z
    .string()
    .describe('An explanation of the improvements made and why.'),
});

export type SuggestCodeImprovementsOutput = z.infer<
  typeof SuggestCodeImprovementsOutputSchema
>;

export async function suggestCodeImprovements(
  input: SuggestCodeImprovementsInput
): Promise<SuggestCodeImprovementsOutput> {
  const cacheKey = cache.hash(input);
  const cached = await cache.get<SuggestCodeImprovementsOutput>(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await suggestCodeImprovementsFlow(input);
  await cache.set(cacheKey, result);
  return result;
}

const prompt = ai.definePrompt({
  name: 'suggestCodeImprovementsPrompt',
  input: {schema: SuggestCodeImprovementsInputSchema},
  output: {schema: SuggestCodeImprovementsOutputSchema},
  prompt: `You are an AI code assistant that suggests improvements to given code snippets.

You will receive a code snippet, the user's knowledge level, and the programming language. Based on this, you will provide an improved version of the code snippet, and an explanation of the changes you made.

Consider the user's knowledge level when making suggestions. For beginner level, focus on basic improvements and clear explanations. For advanced level, suggest more complex optimizations and assume the user has a strong understanding of the language.

Code Snippet:
\`\`\`{{{programmingLanguage}}}
{{{codeSnippet}}}
\`\`\`

Knowledge Level: {{{knowledgeLevel}}}`,
});

const suggestCodeImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestCodeImprovementsFlow',
    inputSchema: SuggestCodeImprovementsInputSchema,
    outputSchema: SuggestCodeImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
