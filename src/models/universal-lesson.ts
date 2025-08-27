
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

const DeepDiveSectionSchema = z.object({
    title: z.string().describe("The title of the deep dive section."),
    content: z.string().describe("A more advanced, academic explanation of the topic, formatted in Markdown."),
    references: z.array(z.string()).optional().describe("A list of academic or external references, if applicable.")
});

const NarrativeSectionSchema = z.object({
    title: z.string().describe("An engaging title for the story, e.g., 'The Journey of a Water Droplet'."),
    story: z.string().describe("A narrative that explains the topic through storytelling, making it engaging and memorable. Formatted in Markdown."),
    moral: z.string().optional().describe("A concluding sentence that summarizes the key takeaway of the story, like a moral."),
});


// Main Lesson Schema
export const UniversalLessonSchema = z.object({
  title: z.string().describe('A clear, engaging title for the lesson.'),
  introduction: IntroductionSchema,
  stepByStep: z.array(StepSchema).describe("A sequential, step-by-step breakdown of the topic."),
  deepDive: DeepDiveSectionSchema.describe("An advanced, academic explanation for learners who want more detail."),
  narrative: NarrativeSectionSchema.optional().describe("An engaging story or narrative to explain the topic."),
  realWorldApplication: z.string().describe("A practical, real-world use case for the topic being taught."),
  summary: z.string().describe("A brief summary to reinforce the main points of the lesson."),
  knowledgeLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional().describe('The intended knowledge level for this lesson.'),
});

export type UniversalLesson = z.infer<typeof UniversalLessonSchema>;
