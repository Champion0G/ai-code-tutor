
'use server';

/**
 * @fileOverview Generates a more detailed explanation of a lesson topic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const KeyConceptSchema = z.object({
  title: z.string().describe('The title of the key concept.'),
  explanation: z
    .string()
    .describe(
      'A detailed but easy-to-understand explanation of the concept.'
    ),
  codeExample: z.string().optional().describe('A concise and relevant code example to illustrate the concept.'),
  codeExplanation: z.string().optional().describe('A brief explanation of the code example.'),
});

export const GenerateLessonOutputSchema = z.object({
  title: z.string().describe('A suitable title for the lesson.'),
  introduction: z
    .string()
    .describe('A brief and engaging introduction to the topic.'),
  keyConcepts: z
    .array(KeyConceptSchema)
    .describe(
      'An array of key concepts that are crucial to understanding the topic.'
    ),
  conclusion: z.string().describe('A summary of the lesson and next steps.'),
});
export type GenerateLessonOutput = z.infer<typeof GenerateLessonOutputSchema>;


const ExplainTopicFurtherInputSchema = z.object({
  lesson: GenerateLessonOutputSchema.describe('The original lesson that was generated.'),
});
export type ExplainTopicFurtherInput = z.infer<typeof ExplainTopicFurtherInputSchema>;

const ExplainTopicFurtherOutputSchema = z.object({
  furtherExplanation: z.string().describe('A more in-depth explanation of the topic, possibly with analogies or more complex examples.'),
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

Expand upon the key concepts of the original lesson. Provide more depth, use analogies, or introduce slightly more advanced examples to help the user understand the topic better. Structure the explanation in a clear, easy-to-digest format.

Original Lesson Title: {{{lesson.title}}}

Original Lesson Introduction:
{{{lesson.introduction}}}

Original Lesson Key Concepts:
{{#each lesson.keyConcepts}}
- Concept: {{{this.title}}}
  - Explanation: {{{this.explanation}}}
  {{#if this.codeExample}}
  - Code: \`\`\`{{this.codeExample}}\`\`\`
  {{/if}}
{{/each}}

Original Lesson Conclusion:
{{{lesson.conclusion}}}

Now, provide a more detailed explanation based on the above lesson.
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
