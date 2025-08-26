import { config } from 'dotenv';
config();

import '@/ai/flows/explain-code-snippet.ts';
import '@/ai/flows/suggest-code-improvements.ts';
import '@/ai/flows/summarize-file-and-qa.ts';