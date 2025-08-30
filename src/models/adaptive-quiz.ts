
import { z } from 'zod';

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

export const AllQuestionSchemas = z.union([McqQuestionSchema, TrueFalseQuestionSchema, ShortAnswerQuestionSchema]);
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
