
'use server';

/**
 * @fileOverview Answers a user's question about a specific lesson topic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerTopicQuestionInputSchema = z.object({
  lessonContent: z.string().describe('The full content of the lesson that was generated.'),
  userQuestion: z.string().describe('The specific question the user has about the lesson.'),
});
export type AnswerTopicQuestionInput = z.infer<typeof AnswerTopicQuestionInputSchema>;

const AnswerTopicQuestionOutputSchema = z.object({
  answer: z.string().describe('A clear and concise answer to the user\'s question, based on the lesson content.'),
});
export type AnswerTopicQuestionOutput = z.infer<typeof AnswerTopicQuestionOutputSchema>;

export async function answerTopicQuestion(
  input: AnswerTopicQuestionInput
): Promise<AnswerTopicQuestionOutput> {
  return answerTopicQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerTopicQuestionPrompt',
  input: {schema: AnswerTopicQuestionInputSchema},
  output: {schema: AnswerTopicQuestionOutputSchema},
  prompt: `You are an expert programming tutor. The user has been presented with a lesson and now has a specific question about it.

Based on the lesson content provided, answer the user's question clearly and concisely. If the question is outside the scope of the lesson, politely state that you can only answer questions related to the provided material.

Lesson Content:
---
{{{lessonContent}}}
---

User's Question:
"{{{userQuestion}}}"
`,
});

const answerTopicQuestionFlow = ai.defineFlow(
  {
    name: 'answerTopicQuestionFlow',
    inputSchema: AnswerTopicQuestionInputSchema,
    outputSchema: AnswerTopicQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
