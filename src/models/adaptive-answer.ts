
import {z} from 'genkit';

const QuizScoreSchema = z
  .object({
    score: z.number(),
    total: z.number(),
  })
  .nullable()
  .describe(
    "The user's score on the last quiz for this topic. Null if not taken."
  );

export const AdaptiveAnswerQuestionInputSchema = z.object({
  lessonContent: z
    .string()
    .describe('The full content of the lesson that was generated.'),
  userQuestion: z
    .string()
    .describe('The specific question the user has about the lesson.'),
  userSummary: z
    .string()
    .optional()
    .describe(
      "The user's attempt at summarizing the lesson. This reveals their understanding."
    ),
  quizScore: QuizScoreSchema,
});
export type AdaptiveAnswerQuestionInput = z.infer<
  typeof AdaptiveAnswerQuestionInputSchema
>;

const AnswerSectionSchema = z.object({
  title: z.string().describe('The title of the explanation section.'),
  content: z
    .string()
    .describe(
      'The detailed content of this section, formatted as well-structured Markdown.'
    ),
  analogy: z.string().optional().describe('A relatable analogy to help understanding.'),
});

export const AdaptiveAnswerQuestionOutputSchema = z.object({
  title: z
    .string()
    .describe('An engaging title for the answer, e.g., "Let\'s Talk About Closures".'),
  introduction: z
    .string()
    .describe('A short, engaging introduction to the answer.'),
  sections: z
    .array(AnswerSectionSchema)
    .describe(
      'An array of detailed explanation sections, each focusing on a specific aspect of the answer.'
    ),
  conclusion: z.string().describe('A concluding summary that wraps up the answer.'),
});
export type AdaptiveAnswerQuestionOutput = z.infer<
  typeof AdaptiveAnswerQuestionOutputSchema
>;
