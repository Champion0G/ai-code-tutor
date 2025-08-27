
'use server';

/**
 * @fileOverview An adaptive AI agent that answers a user's question about a lesson,
 * taking into account the user's recent performance on quizzes and summaries.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const QuizScoreSchema = z.object({
  score: z.number(),
  total: z.number(),
}).nullable().describe('The user\'s score on the last quiz for this topic. Null if not taken.');

export const AdaptiveAnswerQuestionInputSchema = z.object({
  lessonContent: z.string().describe('The full content of the lesson that was generated.'),
  userQuestion: z.string().describe('The specific question the user has about the lesson.'),
  userSummary: z.string().optional().describe("The user's attempt at summarizing the lesson. This reveals their understanding."),
  quizScore: QuizScoreSchema,
});
export type AdaptiveAnswerQuestionInput = z.infer<typeof AdaptiveAnswerQuestionInputSchema>;


const AnswerSectionSchema = z.object({
  title: z.string().describe('The title of the explanation section.'),
  content: z.string().describe('The detailed content of this section, formatted as well-structured Markdown.'),
  analogy: z.string().optional().describe('A relatable analogy to help understanding.'),
});


export const AdaptiveAnswerQuestionOutputSchema = z.object({
  title: z.string().describe('An engaging title for the answer, e.g., "Let\'s Talk About Closures".'),
  introduction: z.string().describe('A short, engaging introduction to the answer.'),
  sections: z.array(AnswerSectionSchema).describe('An array of detailed explanation sections, each focusing on a specific aspect of the answer.'),
  conclusion: z.string().describe('A concluding summary that wraps up the answer.'),
});
export type AdaptiveAnswerQuestionOutput = z.infer<typeof AdaptiveAnswerQuestionOutputSchema>;

export async function adaptiveAnswerQuestion(
  input: AdaptiveAnswerQuestionInput
): Promise<AdaptiveAnswerQuestionOutput> {
  return adaptiveAnswerQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptiveAnswerQuestionPrompt',
  input: {schema: AdaptiveAnswerQuestionInputSchema},
  output: {schema: AdaptiveAnswerQuestionOutputSchema},
  model: googleAI('gemini-1.5-flash-latest'),
  prompt: `You are an Adaptive AI Tutor. Your primary goal is to help a user understand a topic by answering their questions.
However, you must be adaptive. You have context about the user's recent performance, and you must use it to tailor your response.

**1. Analyze the User's State:**
- **Lesson Content:** This is the source of truth.
- **User's Question:** This is the immediate query to address.
- **User's Summary:** If provided, this is a GOLDMINE. It shows what the user *thinks* is important and what they misunderstood.
- **Quiz Score:** If provided, a low score (e.g., < 70%) indicates knowledge gaps. A high score means they have a good grasp.

**2. Your Task:**
- Answer the user's question directly and clearly.
- **Crucially, if you detect a misunderstanding or knowledge gap from their summary or quiz score, you must gently correct it and reinforce the correct concepts within your answer.**
- Frame your answer in an engaging, structured way. Use Markdown for formatting.
- Break the answer down into a title, introduction, 2-3 detailed sections, and a conclusion.

**CONTEXT:**

**Original Lesson Content:**
---
{{{lessonContent}}}
---

**User's Performance Data:**
- **Quiz Score:** {{#if quizScore}}{{quizScore.score}} / {{quizScore.total}}{{else}}Not taken.{{/if}}
- **User's Own Summary:** "{{#if userSummary}}{{{userSummary}}}{{else}}Not provided.{{/if}}"

**User's Immediate Question:**
"{{{userQuestion}}}"

**Execution Plan:**
1.  **Synthesize:** Read all the context. What is the user really asking? What do they seem to be missing?
2.  **Address the Core Question:** Formulate a direct answer.
3.  **Incorporate Adaptive Feedback:** Weave in corrections or elaborations based on their performance data. For example, if their summary missed a key step, mention it in a relevant section of your answer. If they did poorly on the quiz, maybe simplify the language or add a stronger analogy. If they did well, you can use more advanced terminology.
4.  **Structure the Output:** Format your synthesized response into the required JSON schema with a title, intro, sections, and conclusion.
`,
});

const adaptiveAnswerQuestionFlow = ai.defineFlow(
  {
    name: 'adaptiveAnswerQuestionFlow',
    inputSchema: AdaptiveAnswerQuestionInputSchema,
    outputSchema: AdaptiveAnswerQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    