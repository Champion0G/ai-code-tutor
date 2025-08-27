
'use server';

/**
 * @fileOverview DEPRECATED - Use adaptive-answer-question.ts instead.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const AnswerTopicQuestionInputSchema = z.object({
  lessonContent: z.string().describe('The full content of the lesson that was generated.'),
  userQuestion: z.string().describe('The specific question the user has about the lesson.'),
});
export type AnswerTopicQuestionInput = z.infer<typeof AnswerTopicQuestionInputSchema>;


const AnswerSectionSchema = z.object({
  title: z.string().describe('The title of the explanation section.'),
  content: z.string().describe('The detailed content of this section, formatted as well-structured Markdown.'),
  analogy: z.string().optional().describe('A relatable analogy to help understanding.'),
});


const AnswerTopicQuestionOutputSchema = z.object({
  title: z.string().describe('An engaging title for the answer, e.g., "Let\'s Talk About Closures".'),
  introduction: z.string().describe('A short, engaging introduction to the answer.'),
  sections: z.array(AnswerSectionSchema).describe('An array of detailed explanation sections, each focusing on a specific aspect of the answer.'),
  conclusion: z.string().describe('A concluding summary that wraps up the answer.'),
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

Your task is to answer the user's question by breaking down the topic into more depth, using analogies and clear, well-structured sections. Make it engaging and fun to read, not just a wall of text.
Use Markdown formatting for the content of each section (e.g., headings, lists, bold text, code blocks) to ensure it is reader-friendly.

Lesson Content:
---
{{{lessonContent}}}
---

User's Question:
"{{{userQuestion}}}"

Now, generate a structured answer to the user's question.
- Create a main title for this answer.
- Write a brief introduction.
- Create at least 2-3 detailed sections. Each section needs a title, detailed content in Markdown, and a fun, relatable analogy.
- Write a concluding summary.
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

    