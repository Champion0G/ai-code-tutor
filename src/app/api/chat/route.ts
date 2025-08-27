// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { withErrorHandling } from "@/utils/withErrorHandling";

// Import the flow — IMPORTANT: import the server-side flow and call it here,
// but if flows export objects (not an async fn), wrap them in an adapter.
// Example below assumes you have a server-side function to answer a question.
// If your flow is an object (like ai.defineFlow(...)) provide a small adapter.

import { answerTopicQuestion as rawAnswerTopicQuestion } from "@/ai/flows/answer-topic-question";

// Adapter: if rawAnswerTopicQuestion is a function, use it. Otherwise, if it's a flow object,
// call its run or prompt method depending on your ai framework. Adjust this adapter to your flow shape.
async function answerTopicQuestionAdapter(input: any) {
  // If flow exports an async function
  if (typeof rawAnswerTopicQuestion === "function") {
    return await rawAnswerTopicQuestion(input);
  }

  // Otherwise try common flow object shapes (adjust to your project)
  // This is a best-effort adapter — edit if your flow object uses different API.
  if (rawAnswerTopicQuestion && typeof (rawAnswerTopicQuestion as any).run === "function") {
    return await (rawAnswerTopicQuestion as any).run(input);
  }
  if (rawAnswerTopicQuestion && typeof (rawAnswerTopicQuestion as any).call === "function") {
    return await (rawAnswerTopicQuestion as any).call(input);
  }

  throw new Error("answerTopicQuestion flow is not callable - please export an async function or provide an adapter");
}

const handler = withErrorHandling(async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  const { lessonContent, userQuestion } = body ?? {};

  if (!userQuestion || typeof userQuestion !== "string") {
    throw new Error("Missing userQuestion in request body");
  }
  if (!lessonContent || typeof lessonContent !== "string") {
    // you can allow empty context (depends on your app). Here we require lessonContent.
    throw new Error("Missing lessonContent in request body");
  }

  const result = await answerTopicQuestionAdapter({ lessonContent, userQuestion });
  // result should be an object; return it directly
  return { reply: result };
});

export async function POST(req: Request) {
  const r = await handler(req);
  return NextResponse.json(r);
}
