
'use server';

/**
 * @fileOverview An AI agent to summarize an entire repository based on its file structure.
 *
 * - summarizeRepository - A function that handles the repository summarization process.
 * - SummarizeRepositoryInput - The input type for the summarizeRepository function.
 * - SummarizeRepositoryOutput - The return type for the summarizeRepository function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import cache from '@/services/cache';
import type { FileNode } from '@/lib/mock-data';

// Zod schema for FileNode to be used in the input.
const FileNodeSchema: z.ZodType<FileNode> = z.lazy(() =>
  z.object({
    type: z.enum(['file', 'folder']),
    name: z.string(),
    path: z.string(),
    content: z.string().optional(),
    children: z.array(FileNodeSchema).optional(),
  })
);

const SummarizeRepositoryInputSchema = z.object({
  fileTree: z.array(FileNodeSchema).describe('The file and folder structure of the repository.'),
});
export type SummarizeRepositoryInput = z.infer<typeof SummarizeRepositoryInputSchema>;

const SummarizeRepositoryOutputSchema = z.object({
  summary: z.string().describe('A high-level summary of the repository, including its purpose, technologies used, and architecture.'),
});
export type SummarizeRepositoryOutput = z.infer<typeof SummarizeRepositoryOutputSchema>;

// Helper function to convert the file tree to a string representation for the prompt.
function stringifyFileTree(nodes: FileNode[], prefix = ''): string {
    let result = '';
    for (const node of nodes) {
        result += `${prefix}${node.type === 'folder' ? '📁' : '📄'} ${node.name}\n`;
        if (node.children) {
            result += stringifyFileTree(node.children, prefix + '  ');
        }
    }
    return result;
}


export async function summarizeRepository(input: SummarizeRepositoryInput): Promise<SummarizeRepositoryOutput> {
  const cacheKey = cache.hash(input);
  const cached = await cache.get<SummarizeRepositoryOutput>(cacheKey);
  if (cached) {
    return cached;
  }
  
  const result = await summarizeRepositoryFlow(input);
  await cache.set(cacheKey, result);
  return result;
}

const prompt = ai.definePrompt({
  name: 'summarizeRepositoryPrompt',
  input: {schema: SummarizeRepositoryInputSchema},
  output: {schema: SummarizeRepositoryOutputSchema},
  prompt: `You are an AI assistant that provides high-level summaries of code repositories.

Based on the file and folder structure provided below, please generate a summary. The summary should cover:
1. The likely purpose of the repository.
2. The technologies and frameworks being used (e.g., Next.js, React, Tailwind CSS).
3. The overall architecture or structure of the project.

Do not analyze file contents, only the file structure.

File Structure:
\`\`\`
{{{stringifyFileTree fileTree}}}
\`\`\`

Provide a concise, high-level summary in the 'summary' field.`,
}, {
    helpers: {
        stringifyFileTree: (nodes: FileNode[]) => stringifyFileTree(nodes),
    }
});

const summarizeRepositoryFlow = ai.defineFlow(
  {
    name: 'summarizeRepositoryFlow',
    inputSchema: SummarizeRepositoryInputSchema,
    outputSchema: SummarizeRepositoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
