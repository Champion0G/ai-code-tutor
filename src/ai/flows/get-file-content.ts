
'use server';

/**
 * @fileOverview Fetches the content of a file from a given URL.
 * This is primarily used for fetching file content from the GitHub API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetFileContentInputSchema = z.object({
  downloadUrl: z.string().url().describe('The raw content URL of the file to fetch.'),
});
export type GetFileContentInput = z.infer<typeof GetFileContentInputSchema>;

const GetFileContentOutputSchema = z.object({
  content: z.string().describe('The text content of the file.'),
});
export type GetFileContentOutput = z.infer<typeof GetFileContentOutputSchema>;


export async function getFileContent(
  input: GetFileContentInput
): Promise<GetFileContentOutput> {
  return getFileContentFlow(input);
}


const getFileContentFlow = ai.defineFlow(
  {
    name: 'getFileContentFlow',
    inputSchema: GetFileContentInputSchema,
    outputSchema: GetFileContentOutputSchema,
  },
  async (input) => {
    const response = await fetch(input.downloadUrl, {
        headers: {
            'Accept': 'application/vnd.github.v3.raw',
        }
    });

    if (!response.ok) {
        console.error(`Failed to fetch file content from ${input.downloadUrl}: ${response.statusText}`);
        throw new Error('Could not load file content from GitHub.');
    }
    
    const content = await response.text();
    return { content };
  }
);
