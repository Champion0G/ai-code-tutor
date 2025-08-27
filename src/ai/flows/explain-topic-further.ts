
'use server';

/**
 * @fileOverview Generates a more detailed explanation of a lesson topic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateLessonOutput, GenerateLessonOutputSchema } from '@/models/lesson';


const ExplainTopicFurtherInputSchema = z.object({
  lesson: GenerateLessonOutputSchema.describe('The original lesson that was generated.'),
});
export type ExplainTopicFurtherInput = z.infer<typeof ExplainTopicFurtherInputSchema>;

const FurtherExplanationSectionSchema = z.object({
  title: z.string().describe('The title of the explanation section.'),
  content: z.string().describe('The detailed content of this section, formatted as well-structured Markdown.'),
  analogy: z.string().optional().describe('A relatable analogy to help understanding.'),
});

const ExplainTopicFurtherOutputSchema = z.object({
  title: z.string().describe('An engaging title for the deeper dive, e.g., "Diving Deeper into DevOps".'),
  introduction: z.string().describe('A short, engaging introduction to the more detailed explanation.'),
  sections: z.array(FurtherExplanationSectionSchema).describe('An array of detailed explanation sections, each focusing on a specific aspect.'),
  conclusion: z.string().describe('A concluding summary that wraps up the detailed explanation.'),
});

export type ExplainTopicFurtherOutput = z.infer<typeof ExplainTopicFurtherOutputSchema>;

export async function explainTopicFurther(
  input: ExplainTopicFurtherInput
): Promise<ExplainTopicFurtherOutput> {
  const typedInput = { lesson: input.lesson as GenerateLessonOutput };
  return explainTopicFurtherFlow(typedInput);
}

const prompt = ai.definePrompt({
  name: 'explainTopicFurtherPrompt',
  input: {schema: ExplainTopicFurtherInputSchema},
  output: {schema: ExplainTopicFurtherOutputSchema},
  prompt: `You are an expert programming tutor. A user has requested a more detailed explanation of a lesson you previously provided.

Your task is to break down the topic into more depth, using analogies and clear, well-structured sections. Make it engaging and fun to read, not just a wall of text.
Use Markdown formatting for the content of each section (e.g., headings, lists, bold text, code blocks) to ensure it is reader-friendly.

Original Lesson Title: {{{lesson.title}}}

Original Lesson Content:
---
{{{lesson.introduction}}}
{{#each lesson.keyConcepts}}
- {{{this.title}}}: {{{this.explanation}}}
{{/each}}
---

Now, generate a more detailed, structured explanation based on the above lesson.
- Create a main title for this "deeper dive".
- Write a brief introduction.
- Create at least 3-4 detailed sections. Each section needs a title, detailed content in Markdown, and a fun, relatable analogy.
- Write a concluding summary.
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
