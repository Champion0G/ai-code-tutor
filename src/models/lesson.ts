
import { z } from 'zod';

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
