
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


async function getFileContent(url: string): Promise<string> {
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/vnd.github.v3.raw',
        }
    });
     if (!response.ok) {
        console.error(`Failed to fetch file content from ${url}: ${response.statusText}`);
        return `Error: Could not load file content.`;
    }
    return response.text();
}


function buildFileTree(paths: any[], owner: string, repo: string): FileNode[] {
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
            currentPath = i === 0 ? part : `${currentPath}/${part}`;
            
            if (!nodeMap[currentPath]) {
                const isFile = item.type === 'blob' && i === pathParts.length - 1;
                const node: FileNode = {
                    name: part,
                    path: currentPath,
                    type: isFile ? 'file' : 'folder',
                    children: isFile ? undefined : [],
                };

                if (isFile) {
                    // This is a simplified approach. For large repos, fetching all files at once
                    // is not ideal. But for this prototype, it's acceptable.
                    // We are not fetching content here to avoid hitting rate limits.
                    // Content will be fetched on demand when a file is selected.
                    // However, our current structure doesn't support that easily.
                    // For now, we will leave content empty.
                }

                nodeMap[currentPath] = node;
                parentChildren.push(node);
            }
            
            if (nodeMap[currentPath].type === 'folder') {
                 parentChildren = nodeMap[currentPath].children!;
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

    const fileTree = buildFileTree(filteredTree, owner, repo);

    // This is disabled for now to prevent excessive API calls.
    // The content can be fetched when a file is selected in the UI.
    /*
    for (const item of filteredTree) {
        if (item.type === 'blob') {
            const node = findNodeByPath(fileTree, item.path);
            if (node) {
                node.content = await getFileContent(item.url);
            }
        }
    }
    */
    
    return { fileTree };
  }
);
