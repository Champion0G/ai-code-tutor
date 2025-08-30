
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/explain-code-snippet.ts';
import '@/ai/flows/suggest-code-improvements.ts';
import '@/ai/flows/summarize-file-and-qa.ts';
import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/generate-lesson.ts';
import '@/ai/flows/import-github-repo.ts';
import '@/ai/flows/get-file-content.ts';
import '@/ai/flows/explain-topic-further.ts';
import '@/ai/flows/answer-topic-question.ts';
import '@/ai/flows/generate-universal-lesson.ts';
import '@/ai/flows/get-feedback-on-summary.ts';
import '@/ai/flows/summarize-repository.ts';
import '@/ai/flows/generate-adaptive-quiz.ts';
