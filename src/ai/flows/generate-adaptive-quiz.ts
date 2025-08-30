'use server';

/**
 * @fileOverview Generates an adaptive quiz based on a topic and cognitive difficulty level.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const QuizDifficultySchema = z.enum([
  "Beginner (Recall)",
  "Intermediate (Apply)",
  "Advanced (Analyze)",
  "Expert (Create/Evaluate)"
]);
export type QuizDifficulty = z.infer<typeof QuizDifficultySchema>;

const McqQuestionSchema = z.object({
    type: z.literal("mcq"),
    question: z.string().describe("The multiple-choice question."),
    options: z.array(z.string()).min(4).max(4).describe("An array of exactly 4 possible answers."),
    correctAnswer: z.string().describe("The correct answer from the options."),
});

const TrueFalseQuestionSchema = z.object({
    type: z.literal("true-false"),
    question: z.string().describe("A statement that is either true or false."),
    correctAnswer: z.boolean().describe("Whether the statement is true or false."),
});

const ShortAnswerQuestionSchema = z.object({
    type: z.literal("short-answer"),
    question: z.string().describe("A question that requires a brief, open-ended answer."),
    idealAnswer: z.string().describe("The ideal or model answer to the question for evaluation."),
});

const AllQuestionSchemas = z.union([McqQuestionSchema, TrueFalseQuestionSchema, ShortAnswerQuestionSchema]);
export type AllQuestionType = z.infer<typeof AllQuestionSchemas>;

export const GenerateAdaptiveQuizInputSchema = z.object({
  topic: z.string().describe("The topic the user wants to be tested on."),
  difficulty: QuizDifficultySchema.describe("The cognitive difficulty level based on Bloom's Taxonomy."),
});
export type GenerateAdaptiveQuizInput = z.infer<typeof GenerateAdaptiveQuizInputSchema>;

export const GenerateAdaptiveQuizOutputSchema = z.object({
    title: z.string().describe("A fitting title for the quiz, like 'Advanced Cybersecurity Challenge'."),
    questions: z.array(AllQuestionSchemas).min(5).max(5).describe("An array of exactly 5 quiz questions of mixed types."),
    difficulty: QuizDifficultySchema.describe("The difficulty level this quiz was generated for."),
});
export type GenerateAdaptiveQuizOutput = z.infer<typeof GenerateAdaptiveQuizOutputSchema>;


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
