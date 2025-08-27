
'use server';

/**
 * @fileOverview Answers a user's question about a specific lesson topic.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const AnswerTopicQuestionInputSchema = z.object({
  lessonContent: z.string().describe('The full content of the lesson that was generated.'),
  userQuestion: z.string().describe('The specific question the user has about the lesson.'),
});
export type AnswerTopicQuestionInput = z.infer<typeof AnswerTopicQuestionInputSchema>;

const AnswerTopicQuestionOutputSchema = z.object({
  answer: z.string().describe('A clear and concise answer to the user\'s question, based on the lesson content, formatted as Markdown.'),
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
  model: googleAI('gemini-1.5-flash-latest'),
  prompt: `You are an expert programming tutor. The user has been presented with a lesson and now has a specific question about it.

Answer the user's question clearly and concisely. Use Markdown for formatting (e.g., headings, lists, bold text, code blocks) to make the answer easy to read.

While you should use the lesson content as the primary context, feel free to provide additional information or answer questions about related concepts, even if they are not explicitly covered in the lesson. Your goal is to help the user understand the broader topic.

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
