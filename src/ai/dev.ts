'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/explain-code-snippet.ts';
import '@/ai/flows/suggest-code-improvements.ts';
import '@/ai/flows/summarize-file-and-qa.ts';
import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/generate-lesson.ts';
