
'use server';

/**
 * @fileOverview Generates a more detailed explanation of a lesson topic, adapting to the user's performance.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { UniversalLesson, UniversalLessonSchema } from '@/models/universal-lesson';


const ExplainTopicFurtherInputSchema = z.object({
  lesson: UniversalLessonSchema.describe('The original lesson that was generated.'),
  quizScore: z.number().optional().describe("The user's percentage score on the quiz (e.g., 80 for 80%). Helps gauge understanding."),
  userSummary: z.string().optional().describe("The user's attempt at summarizing the lesson. Helps identify misconceptions."),
});
export type ExplainTopicFurtherInput = z.infer<typeof ExplainTopicFurtherInputSchema>;

const FurtherExplanationSectionSchema = z.object({
  title: z.string().describe('The title of the explanation section.'),
  content: z.string().describe('The detailed content of this section, formatted as well-structured Markdown.'),
  analogy: z.string().optional().describe('A relatable analogy to help understanding.'),
});

const ExplainTopicFurtherOutputSchema = z.object({
  title: z.string().describe('An engaging title for the deeper dive, e.g., "Diving Deeper into The Water Cycle" or "Challenge Mode: Advanced Water Cycle Concepts".'),
  introduction: z.string().describe('A short, engaging introduction to the more detailed explanation that acknowledges the user\'s performance.'),
  sections: z.array(FurtherExplanationSectionSchema).describe('An array of detailed explanation sections, each focusing on a specific aspect.'),
  conclusion: z.string().describe('A concluding summary that wraps up the detailed explanation.'),
});

export type ExplainTopicFurtherOutput = z.infer<typeof ExplainTopicFurtherOutputSchema>;

export async function explainTopicFurther(
  input: ExplainTopicFurtherInput
): Promise<ExplainTopicFurtherOutput> {
  const typedInput = { lesson: input.lesson as UniversalLesson, quizScore: input.quizScore, userSummary: input.userSummary };
  return explainTopicFurtherFlow(typedInput);
}

const prompt = ai.definePrompt({
  name: 'explainTopicFurtherPrompt',
  input: {schema: ExplainTopicFurtherInputSchema},
  output: {schema: ExplainTopicFurtherOutputSchema},
  prompt: `You are an expert Adaptive AI Tutor. A user has requested a more detailed explanation of a lesson. Your task is to adapt the explanation based on their performance.

Original Lesson Title: {{{lesson.title}}}

User Performance Data:
- Quiz Score: {{#if quizScore}}{{quizScore}}%{{else}}N/A{{/if}}
- User's Summary of Lesson: {{#if userSummary}}"{{{userSummary}}}"{{else}}N/A{{/if}}

**Your Task:**

1.  **Analyze Performance**: Review the quiz score and user summary.
2.  **Adapt the Content**:
    -   **If the user is struggling (quiz score < 70% or summary shows clear misconceptions)**: Your primary goal is to re-teach and clarify. Break down the *original* concepts into even simpler terms. Use new analogies and reinforce the fundamentals. The title should reflect this, like "Let's Review the Basics of...".
    -   **If the user is doing well (quiz score >= 70% and summary is accurate)**: Your goal is to challenge them. Introduce more advanced, related, or tangential concepts. Provide a "Challenge Mode" or "Boss Battle" type of explanation that builds upon their solid foundation. The title should be exciting, like "Advanced Concepts in..." or "Challenge: Beyond the Basics of...".
    -   **If performance data is unavailable**: Provide a standard, detailed explanation that goes one level deeper than the original lesson.

3.  **Generate the Explanation**:
    -   Create a main title for this "deeper dive" that reflects the adaptive strategy you chose.
    -   Write a brief introduction that sets the stage.
    -   Create at least 3-4 detailed sections. Each section needs a title, detailed content in Markdown, and (if helpful) a new analogy.
    -   Write a concluding summary.

Use Markdown for rich formatting. Make it engaging and appropriate for their level of understanding.
`,
});

const explainTopicFurtherFlow = ai.defineFlow(
  {
    name: 'explainTopicFurtherFlow',
    inputSchema: ExplainTopicFurtherInputSchema,
    outputSchema: ExplainTopicFurtherOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

