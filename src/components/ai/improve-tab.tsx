"use client";

import { useState } from "react";
import { suggestCodeImprovements } from "@/ai/flows/suggest-code-improvements";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb } from "lucide-react";

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

  const handleImprove = async () => {
    if (!selectedSnippet) {
      setError("Please select a code snippet in the editor first.");
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
      <div className="flex-shrink-0">
        <h3 className="text-lg font-semibold">Suggest Improvements</h3>
        <p className="text-sm text-muted-foreground">
          Get AI-powered suggestions to improve your selected code.
        </p>
      </div>

      <RadioGroup
        defaultValue="intermediate"
        onValueChange={(v: KnowledgeLevel) => setKnowledgeLevel(v)}
        className="flex space-x-4"
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

      <div className="flex-1 overflow-auto bg-muted/50 rounded-lg p-4 min-h-[150px]">
        <ScrollArea className="h-full">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : result ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Improved Code:</h4>
              <pre className="p-2 text-sm font-code bg-background rounded-md">
                <code>{result.improvedCode}</code>
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Explanation:</h4>
              <p className="text-sm whitespace-pre-wrap">{result.explanation}</p>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-10">
            Improvement suggestions will appear here.
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
