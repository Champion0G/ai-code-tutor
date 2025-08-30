
'use server';

/**
 * @fileOverview Generates an adaptive quiz based on a topic and cognitive difficulty level.
 */

import {ai} from '@/ai/genkit';
import { 
    GenerateAdaptiveQuizInput, 
    GenerateAdaptiveQuizInputSchema, 
    GenerateAdaptiveQuizOutput, 
    GenerateAdaptiveQuizOutputSchema 
} from '@/models/adaptive-quiz';


export async function generateAdaptiveQuiz(input: GenerateAdaptiveQuizInput): Promise<GenerateAdaptiveQuizOutput> {
  // Adaptive quizzes should always be fresh, so we don't cache them.
  return generateAdaptiveQuizFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateAdaptiveQuizPrompt',
  input: {schema: GenerateAdaptiveQuizInputSchema},
  output: {schema: GenerateAdaptiveQuizOutputSchema},
  prompt: `You are an expert educator who creates quizzes to test a user's knowledge on a given topic.

Your task is to generate a quiz with 5 questions based on the topic and difficulty level provided. The difficulty levels correspond to Bloom's Taxonomy, which measures cognitive depth.

Topic: {{{topic}}}
Difficulty Level: {{{difficulty}}}

**Difficulty Level Guidelines:**
- **Beginner (Recall):** Focus on direct questions, definitions, terms, and simple multiple-choice questions. (e.g., "What does API stand for?")
- **Intermediate (Apply):** Focus on problem-solving with context. Ask the user to apply knowledge. (e.g., "Which HTTP status code should be used for a missing resource?")
- **Advanced (Analyze):** Focus on case-based questions, debugging scenarios, or comparing concepts. (e.g., "A user reports a 403 error, but they have a valid account. What are two possible reasons?")
- **Expert (Create/Evaluate):** Focus on scenario-based reasoning or mini-project-like questions. Ask the user to design, evaluate, or critique something. (e.g., "Design a basic rate-limiting strategy for a public API. What are its pros and cons?")

**Instructions:**
1. Create a quiz with a suitable title.
2. Generate exactly 5 questions.
3. The questions should be a mix of types: multiple-choice ('mcq'), true/false ('true-false'), and short-answer ('short-answer').
4. The questions must strictly match the requested difficulty level.

Generate the quiz now.`,
});


const generateAdaptiveQuizFlow = ai.defineFlow(
  {
    name: 'generateAdaptiveQuizFlow',
    inputSchema: GenerateAdaptiveQuizInputSchema,
    outputSchema: GenerateAdaptiveQuizOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
