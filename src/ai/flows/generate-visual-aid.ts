
'use server';

/**
 * @fileOverview Generates a visual aid image for a given lesson topic.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const GenerateVisualAidInputSchema = z.object({
  topic: z.string().describe('The main topic of the lesson.'),
  lessonContent: z.string().describe('The full text content of the lesson for context.')
});
export type GenerateVisualAidInput = z.infer<typeof GenerateVisualAidInputSchema>;

const GenerateVisualAidOutputSchema = z.object({
  imageUrl: z.string().url().describe('The data URI of the generated image.'),
});
export type GenerateVisualAidOutput = z.infer<typeof GenerateVisualAidOutputSchema>;

export async function generateVisualAid(
  input: GenerateVisualAidInput
): Promise<GenerateVisualAidOutput> {
  return generateVisualAidFlow(input);
}

const promptTemplate = `You are an expert in creating educational visuals. Your task is to generate a concise prompt for an image generation model to create a helpful visual aid for a lesson.

The visual should be clear, simple, and directly related to the main concept of the lesson. It could be a diagram, a flowchart, an infographic, or a metaphorical representation.

Lesson Topic: {{{topic}}}

Lesson Content:
---
{{{lessonContent}}}
---

Based on the lesson, create a prompt for an image generation model. The prompt should result in a single, clean image that visually explains the core idea. For example, for "CSS Flexbox", a good prompt would be "A simple, clear diagram showing a flex container with items aligned and justified, using arrows and labels." For "The Water Cycle", a good prompt would be "A simple diagram of the water cycle with arrows showing evaporation, condensation, precipitation, and collection."
`;

const generateVisualAidFlow = ai.defineFlow(
  {
    name: 'generateVisualAidFlow',
    inputSchema: GenerateVisualAidInputSchema,
    outputSchema: GenerateVisualAidOutputSchema,
  },
  async (input) => {
    // 1. Generate a good prompt for the image model
    const llmResponse = await ai.generate({
        prompt: promptTemplate,
        model: googleAI('gemini-1.5-flash-latest'),
        context: {
            topic: input.topic,
            lessonContent: input.lessonContent,
        }
    });
    
    const imagePrompt = llmResponse.text;
    
    // 2. Use the generated prompt to create an image
    const { media } = await ai.generate({
        model: googleAI('imagen-4.0-fast-generate-001'),
        prompt: imagePrompt,
        config: {
            aspectRatio: '16:9'
        }
    });

    if (!media.url) {
        throw new Error('Image generation failed to return a URL.');
    }

    return { imageUrl: media.url };
  }
);

    