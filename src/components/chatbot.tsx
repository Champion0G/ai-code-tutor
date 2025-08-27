
"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { MessageSquare, Send, Loader2, X } from "lucide-react";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { answerTopicQuestion, AnswerTopicQuestionOutput } from "@/ai/flows/answer-topic-question";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { CodeAlchemistIcon } from "./icons";
import { cn } from "@/lib/utils";

interface ChatbotProps {
  lessonContext: string;
}

interface Message {
  id: number;
  text: string | AnswerTopicQuestionOutput;
  isUser: boolean;
}

function formatResponse(response: AnswerTopicQuestionOutput): string {
    const sections = response.sections.map(s => `### ${s.title}\n${s.content}${s.analogy ? `\n\n**Analogy:** ${s.analogy}` : ''}`).join('\n\n');
    return `## ${response.title}\n\n${response.introduction}\n\n${sections}\n\n${response.conclusion}`;
}

export function Chatbot({ lessonContext }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now(), text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
        const response = await answerTopicQuestion({ lessonContent: lessonContext, userQuestion: input });
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
        <ScrollArea className="flex-1 p-4">
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
                                        <p className="whitespace-pre-wrap">{section.content}</p>
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
        <footer className="p-4 border-t">
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
