
'use server';

/**
 * @fileOverview Imports a GitHub repository and returns its file structure.
 *
 * - importGithubRepo - A function that handles the repository import process.
 * - ImportGithubRepoInput - The input type for the importGithubRepo function.
 * - ImportGithubRepoOutput - The return type for the importGithubRepo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { FileNode } from '@/lib/mock-data';


const ImportGithubRepoInputSchema = z.object({
  repoUrl: z.string().url().describe('The URL of the public GitHub repository to import.'),
});
export type ImportGithubRepoInput = z.infer<typeof ImportGithubRepoInputSchema>;

// This schema is a bit loose, but reflects the nested structure of a file tree.
const FileNodeSchema: z.ZodType<FileNode> = z.lazy(() =>
  z.object({
    type: z.enum(['file', 'folder']),
    name: z.string(),
    path: z.string(),
    content: z.string().optional(),
    children: z.array(FileNodeSchema).optional(),
  })
);

const ImportGithubRepoOutputSchema = z.object({
  fileTree: z.array(FileNodeSchema).describe('The file and folder structure of the repository.'),
});
export type ImportGithubRepoOutput = z.infer<typeof ImportGithubRepoOutputSchema>;


async function getRepoTree(owner: string, repo: string, branch: string = 'main'): Promise<any[]> {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            // It's better to use an auth token to avoid rate limiting, but for this public-only
            // feature, we can proceed without one for simplicity.
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch repo tree from GitHub: ${response.statusText}`);
    }
    const data = await response.json();
    return data.tree;
}

function buildFileTree(paths: any[]): FileNode[] {
    const fileTree: FileNode[] = [];
    const nodeMap: { [path: string]: FileNode } = {};

    // Sort paths to ensure directories are created before files within them.
    paths.sort((a, b) => a.path.localeCompare(b.path));

    for (const item of paths) {
        const pathParts = item.path.split('/');
        let currentPath = '';
        let parentChildren = fileTree;

        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            const parentPath = currentPath;
            currentPath = i === 0 ? part : `${currentPath}/${part}`;
            
            if (!nodeMap[currentPath]) {
                const isFile = item.type === 'blob' && i === pathParts.length - 1;
                const node: FileNode = {
                    name: part,
                    // For files, we store the raw GitHub API download URL in the path.
                    // This will be used to fetch the content on demand.
                    path: isFile ? item.url : currentPath,
                    type: isFile ? 'file' : 'folder',
                    children: isFile ? undefined : [],
                };

                // No content fetched here to avoid hitting rate limits.
                // Content will be fetched on demand when a file is selected.
                
                nodeMap[currentPath] = node;

                if (parentPath) {
                    nodeMap[parentPath].children!.push(node);
                } else {
                    fileTree.push(node);
                }
            }
        }
    }
    return fileTree;
}


export async function importGithubRepo(
  input: ImportGithubRepoInput
): Promise<ImportGithubRepoOutput> {
  return importGithubRepoFlow(input);
}

const importGithubRepoFlow = ai.defineFlow(
  {
    name: 'importGithubRepoFlow',
    inputSchema: ImportGithubRepoInputSchema,
    outputSchema: ImportGithubRepoOutputSchema,
  },
  async (input) => {
    const { repoUrl } = input;
    const urlParts = repoUrl.replace(/^https?:\/\//, '').split('/');
    const owner = urlParts[1];
    const repo = urlParts[2];
    
    if (!owner || !repo) {
        throw new Error('Invalid GitHub repository URL.');
    }

    // For simplicity, we assume the main branch is 'main'. A more robust solution
    // would fetch the default branch first.
    const treeData = await getRepoTree(owner, repo, 'main');
    
    // We are filtering out some common config/unwanted files to keep the tree clean
    const filteredTree = treeData.filter(item => 
        !item.path.includes('.git') && 
        !item.path.endsWith('.lock') &&
        !item.path.endsWith('.ico') &&
        !item.path.endsWith('.svg')
    );

    const fileTree = buildFileTree(filteredTree);
    
    return { fileTree };
  }
);
