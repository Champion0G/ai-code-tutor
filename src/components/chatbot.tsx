
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { MessageSquare, Send, Loader2, X, BrainCircuit } from "lucide-react";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { answerTopicQuestion, AnswerTopicQuestionOutput } from "@/ai/flows/answer-topic-question";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { CodeAlchemistIcon } from "./icons";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

interface ChatbotProps {
  lessonContext: string;
}

interface Message {
  id: number;
  text: string | AnswerTopicQuestionOutput;
  isUser: boolean;
}

export default function Chatbot({ lessonContext }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);


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

  const handleSend = async (messageText: string, isSocratic: boolean = false) => {
    if (!messageText.trim()) return;

    const userMessage: Message = { id: Date.now(), text: messageText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
        let question = messageText;
        if(isSocratic) {
            question = `Ask me a Socratic question about the topic based on my initial question: "${messageText}". Guide me to discover the answer myself without giving it away directly. Start by asking a clarifying question.`
        }

        const response = await answerTopicQuestion({ lessonContent: lessonContext, userQuestion: question });
        const aiMessage: Message = { id: Date.now() + 1, text: response, isUser: false };
        setMessages(prev => [...prev, aiMessage]);
    } catch(e) {
        console.error("Chatbot error:", e);
        const errorMessage: Message = { id: Date.now() + 1, text: "Sorry, I encountered an error. Please try again.", isUser: false };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSocraticPrompt = () => {
    const socraticInput = input || "this topic";
    handleSend(`Help me understand ${socraticInput} more deeply.`, true);
  };


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
                                <CodeAlchemistIcon className="h-5 w-5" />
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
                                        <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: section.content.replace(/```/g, '<pre><code>').replace(/`/g, '</code>') }} />
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
                                <CodeAlchemistIcon className="h-5 w-5" />
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
            <Button variant="outline" size="sm" className="w-full" onClick={handleSocraticPrompt} disabled={isLoading}>
                <BrainCircuit className="mr-2 h-4 w-4" />
                Guide me (Socratic Method)
            </Button>
            <Separator />
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex items-center gap-2">
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

    