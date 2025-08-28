
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { MessageSquare, Send, Loader2, X, GraduationCap, Sparkles } from "lucide-react";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LexerIcon } from "./icons";
import { cn } from "@/lib/utils";
import { useGamification } from "@/contexts/gamification-context";

import { answerTopicQuestionAction, AnswerTopicQuestionOutput } from "@/app/actions/answer-topic-question-action";


interface ChatbotProps {
  lessonContext: string;
  askSocraticQuestion: (question: string) => Promise<AnswerTopicQuestionOutput>;
}

interface Message {
  id: number;
  text: string | AnswerTopicQuestionOutput;
  isUser: boolean;
}

const examplePrompts = [
    "Explain this to me like I'm five.",
    "What's another analogy for this?",
    "Why is this important?",
]

export default function Chatbot({ lessonContext, askSocraticQuestion }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { checkAndIncrementUsage } = useGamification();


  useEffect(() => {
    if (isOpen && messages.length === 0) {
        const welcomeMessage: Message = { id: Date.now(), text: "Hello! I'm your AI Tutor. Ask me any follow-up questions about the lesson.", isUser: false };
        setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);


  useEffect(() => {
    if (scrollAreaRef.current) {
        // A bit of a hack to scroll to the bottom.
        setTimeout(() => {
            const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const currentInput = messageText || input;
    if (!currentInput.trim()) return;

    const canProceed = await checkAndIncrementUsage();
    if (!canProceed) return;

    const userMessage: Message = { id: Date.now(), text: currentInput, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await answerTopicQuestionAction({ lessonContent: lessonContext, userQuestion: currentInput });

      if (!response.success) {
          throw new Error(response.message);
      }

      const aiMessage: Message = { id: Date.now() + 1, text: response.answer, isUser: false };
      setMessages(prev => [...prev, aiMessage]);
    } catch(e: any) {
      console.error("Chatbot error:", e);
      const errorMessage: Message = { id: Date.now() + 1, text: "Sorry, I encountered an error. Please try again.", isUser: false };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocraticPrompt = async () => {
    const canProceed = await checkAndIncrementUsage();
    if (!canProceed) return;

    const socraticPreamble = "Ask me a socratic question about the lesson to help me think deeper.";
    const userMessage: Message = { id: Date.now(), text: "Prompt: Ask me a socratic question.", isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await askSocraticQuestion(socraticPreamble);
      const aiMessage: Message = { id: Date.now() + 1, text: response, isUser: false };
      setMessages(prev => [...prev, aiMessage]);
    } catch (e: any) {
       console.error("Chatbot socratic error:", e);
       const errorMessage: Message = { id: Date.now() + 1, text: "Sorry, I couldn't generate a socratic question right now.", isUser: false };
       setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 rounded-full h-16 w-16 shadow-lg z-50"
          size="icon"
        >
          {isOpen ? <X className="h-8 w-8" /> : <MessageSquare className="h-8 w-8" />}
          <span className="sr-only">Ask more questions</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-[400px] h-[500px] flex flex-col p-0 mr-4 mb-2"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <header className="p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <h3 className="font-semibold">Ask follow-up questions</h3>
        </header>
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
            {messages.map((message) => (
                <div key={message.id} className={cn("flex items-start gap-3", message.isUser ? "justify-end" : "justify-start")}>
                    {!message.isUser && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                <LexerIcon className="h-5 w-5" />
                            </AvatarFallback>
                        </Avatar>
                    )}
                    <div className={cn("rounded-lg p-3 max-w-[80%] text-sm", message.isUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                         {typeof message.text === 'string' ? (
                            <p className="whitespace-pre-wrap">{message.text}</p>
                         ) : (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <h2>{message.text.title}</h2>
                                <p>{message.text.introduction}</p>
                                {message.text.sections.map((section, index) => (
                                    <div key={index}>
                                        <h3>{section.title}</h3>
                                        <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: section.content.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>').replace(/`(.*?)`/g, '<code>$1</code>') }} />
                                        {section.analogy && <p className="text-xs italic border-l-2 pl-2 my-2"><strong>Analogy:</strong> {section.analogy}</p>}
                                    </div>
                                ))}
                                <p>{message.text.conclusion}</p>
                            </div>
                         )}
                    </div>
                     {message.isUser && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            ))}
             {isLoading && (
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                             <AvatarFallback className="bg-primary text-primary-foreground">
                                <LexerIcon className="h-5 w-5" />
                            </AvatarFallback>
                        </Avatar>
                         <div className="rounded-lg p-3 bg-muted flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin" />
                         </div>
                    </div>
                )}
            </div>
        </ScrollArea>
        <footer className="p-4 border-t space-y-3">
             <div className="flex flex-wrap gap-2">
                {examplePrompts.map(prompt => (
                    <Button key={prompt} size="sm" variant="outline" className="text-xs" onClick={() => handleSend(prompt)} disabled={isLoading}>
                        <Sparkles className="mr-2 h-3 w-3" />
                        {prompt}
                    </Button>
                ))}
             </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1"
                    disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </footer>
      </PopoverContent>
    </Popover>
  );
}
