'use server';
/**
 * @fileOverview A file summarization and question answering AI agent.
 *
 * - summarizeFileAndQA - A function that handles the file summarization and question answering process.
 * - SummarizeFileAndQAInput - The input type for the summarizeFileAndQA function.
 * - SummarizeFileAndQAOutput - The return type for the summarizeFileAndQA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFileAndQAInputSchema = z.object({
  fileContent: z
    .string()
    .describe('The content of the file to summarize and ask questions about.'),
  question: z.string().describe('The question to ask about the file content.'),
});
export type SummarizeFileAndQAInput = z.infer<typeof SummarizeFileAndQAInputSchema>;

const SummarizeFileAndQAOutputSchema = z.object({
  summary: z.string().describe('The summary of the file content.'),
  answer: z.string().describe('The answer to the question about the file content.'),
});
export type SummarizeFileAndQAOutput = z.infer<typeof SummarizeFileAndQAOutputSchema>;

export async function summarizeFileAndQA(input: SummarizeFileAndQAInput): Promise<SummarizeFileAndQAOutput> {
  return summarizeFileAndQAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFileAndQAPrompt',
  input: {schema: SummarizeFileAndQAInputSchema},
  output: {schema: SummarizeFileAndQAOutputSchema},
  prompt: `You are an AI assistant that summarizes files and answers questions about them.

  First, summarize the following file content.

  Then, answer the following question about the file content.

  File Content: {{{fileContent}}}

  Question: {{{question}}}

  Summary:
  {{output summary}}

  Answer:
  {{output answer}}`,
});

const summarizeFileAndQAFlow = ai.defineFlow(
  {
    name: 'summarizeFileAndQAFlow',
    inputSchema: SummarizeFileAndQAInputSchema,
    outputSchema: SummarizeFileAndQAOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
