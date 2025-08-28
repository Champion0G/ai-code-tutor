
"use client";

import { useState } from "react";
import { suggestCodeImprovements } from "@/ai/flows/suggest-code-improvements";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, Rocket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useGamification } from "@/contexts/gamification-context";

interface ImproveTabProps {
  selectedSnippet: string;
  onImprovement: () => void;
}

type KnowledgeLevel = "beginner" | "intermediate" | "advanced";

export function ImproveTab({ selectedSnippet, onImprovement }: ImproveTabProps) {
  const [result, setResult] = useState<{
    improvedCode: string;
    explanation: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [knowledgeLevel, setKnowledgeLevel] =
    useState<KnowledgeLevel>("intermediate");
  const { checkAndIncrementUsage } = useGamification();

  const handleImprove = async () => {
    if (!selectedSnippet) {
      setError("Please select a code snippet in the editor first.");
      return;
    }
    
    const canProceed = await checkAndIncrementUsage();
    if (!canProceed) {
        setError("You have reached your daily AI usage limit.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const improvement = await suggestCodeImprovements({
        codeSnippet: selectedSnippet,
        knowledgeLevel,
      });
      setResult(improvement);
      onImprovement();
    } catch (e) {
      setError("Failed to get improvement suggestions. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex-shrink-0 mt-4">
        <h3 className="text-lg font-semibold">Suggest Improvements</h3>
        <p className="text-sm text-muted-foreground">
          Get AI-powered suggestions to improve your selected code.
        </p>
      </div>

      <div className="flex-shrink-0">
        <RadioGroup
          defaultValue="intermediate"
          onValueChange={(v: KnowledgeLevel) => setKnowledgeLevel(v)}
          className="flex space-x-4"
          disabled={isLoading}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="beginner" id="beginner" />
            <Label htmlFor="beginner">Beginner</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="intermediate" id="intermediate" />
            <Label htmlFor="intermediate">Intermediate</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="advanced" id="advanced" />
            <Label htmlFor="advanced">Advanced</Label>
          </div>
        </RadioGroup>
      </div>


      <div className="flex-1 overflow-auto bg-muted/50 rounded-lg p-2 min-h-[150px]">
        <ScrollArea className="h-full p-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="text-destructive text-center py-10">{error}</div>
        ) : result ? (
          <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-primary" />
                        Improved Code
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="p-2 text-sm font-code bg-background rounded-md overflow-x-auto">
                        <code>{result.improvedCode}</code>
                    </pre>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        Explanation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">{result.explanation}</p>
                </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-10 flex flex-col items-center justify-center h-full">
            <Lightbulb className="h-8 w-8 mb-2" />
            <p>Improvement suggestions will appear here.</p>
          </div>
        )}
        </ScrollArea>
      </div>

      <div className="flex-shrink-0">
        <Button onClick={handleImprove} disabled={isLoading || !selectedSnippet} className="w-full">
          <Lightbulb className="mr-2 h-4 w-4" />
          {isLoading ? "Analyzing..." : "Suggest Improvements"}
        </Button>
      </div>
    </div>
  );
}
