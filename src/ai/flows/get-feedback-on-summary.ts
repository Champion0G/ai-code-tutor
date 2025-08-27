
'use server';

/**
 * @fileOverview Provides feedback on a user's summary of a lesson.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import cache from '@/services/cache';

const GetFeedbackOnSummaryInputSchema = z.object({
  lessonContent: z.string().describe('The original content of the lesson.'),
  userSummary: z.string().describe("The user's summary of the lesson."),
});
export type GetFeedbackOnSummaryInput = z.infer<typeof GetFeedbackOnSummaryInputSchema>;


const GetFeedbackOnSummaryOutputSchema = z.object({
  feedback: z.string().describe('Constructive feedback on the user\'s summary, highlighting correct points and areas for improvement.'),
});
export type GetFeedbackOnSummaryOutput = z.infer<typeof GetFeedbackOnSummaryOutputSchema>;


export async function getFeedbackOnSummary(
  input: GetFeedbackOnSummaryInput
): Promise<GetFeedbackOnSummaryOutput> {
  const cacheKey = cache.hash(input);
  const cached = await cache.get<GetFeedbackOnSummaryOutput>(cacheKey);
  if (cached) {
    return cached;
  }
  
  const result = await getFeedbackOnSummaryFlow(input);
  await cache.set(cacheKey, result);
  return result;
}

const prompt = ai.definePrompt({
  name: 'getFeedbackOnSummaryPrompt',
  input: {schema: GetFeedbackOnSummaryInputSchema},
  output: {schema: GetFeedbackOnSummaryOutputSchema},
  prompt: `You are an expert AI Tutor. The user has just finished a lesson and is attempting to summarize it in their own words. This is a crucial learning step (active recall).

Your task is to provide constructive, encouraging, and specific feedback on their summary.
1.  Acknowledge what they got right.
2.  Gently correct any misunderstandings or inaccuracies.
3.  Suggest key concepts they might have missed.
4.  Keep the tone positive and motivating.

Here is the original lesson content for your reference:
---
{{{lessonContent}}}
---

Here is the user's summary:
---
{{{userSummary}}}
---

Now, please provide your feedback.
`,
});

const getFeedbackOnSummaryFlow = ai.defineFlow(
  {
    name: 'getFeedbackOnSummaryFlow',
    inputSchema: GetFeedbackOnSummaryInputSchema,
    outputSchema: GetFeedbackOnSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
