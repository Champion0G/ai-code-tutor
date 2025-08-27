
import { z } from 'zod';

// Based on the Universal AI Tutor Teaching Framework

// 1. Multi-Mode Explanations
const IntroductionSchema = z.object({
  analogy: z.string().describe("Explain the topic with a simple, real-world comparison. E.g., 'Photosynthesis is like a plant cooking with sunlight.'"),
});

const StepSchema = z.object({
    title: z.string().describe("The title of this specific step."),
    content: z.string().describe("The detailed content for this step."),
});

// 2. Progressive Learning Levels (future enhancement)
// 3. Interactive Reinforcement (future enhancement - quizzes, etc.)
// 4. ADHD-Friendly (handled by structure)
// 5. Multi-Sensory (future enhancement - TTS, visuals)

// 6. Real-World Application
const RealWorldApplicationSchema = z.string().describe("A practical, real-world use case for the topic being taught.");

// 7-10: Other framework points (future enhancements)


// Main Lesson Schema
export const UniversalLessonSchema = z.object({
  title: z.string().describe('A clear, engaging title for the lesson.'),
  introduction: IntroductionSchema,
  stepByStep: z.array(StepSchema).describe("A sequential, step-by-step breakdown of the topic."),
  realWorldApplication: RealWorldApplicationSchema,
  summary: z.string().describe("A brief summary to reinforce the main points of the lesson."),
});

export type UniversalLesson = z.infer<typeof UniversalLessonSchema>;
