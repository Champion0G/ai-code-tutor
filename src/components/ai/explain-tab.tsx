
"use client";

import { useState } from "react";
import { explainCodeSnippet } from "@/ai/flows/explain-code-snippet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { WandSparkles } from "lucide-react";
import { useGamification } from "@/contexts/gamification-context";

interface ExplainTabProps {
  selectedSnippet: string;
  onExplanation: () => void;
}

export function ExplainTab({ selectedSnippet, onExplanation }: ExplainTabProps) {
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkAndIncrementUsage } = useGamification();

  const handleExplain = async () => {
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
    setExplanation("");

    try {
      const result = await explainCodeSnippet({ codeSnippet: selectedSnippet });
      setExplanation(result.explanation);
      onExplanation();
    } catch (e) {
      setError("Failed to get explanation. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex-shrink-0">
        <h3 className="text-lg font-semibold">Code Explanation</h3>
        <p className="text-sm text-muted-foreground">
          Select a piece of code in the editor and click the button to get an
          AI-powered explanation.
        </p>
      </div>
      
      <div className="flex-1 overflow-auto bg-muted/50 rounded-lg p-4 min-h-[150px]">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : error ? (
            <div className="text-destructive">{error}</div>
          ) : explanation ? (
            <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap">{explanation}</div>
          ) : (
            <div className="text-muted-foreground text-center py-10">
              Explanation will appear here.
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-shrink-0">
        <Button onClick={handleExplain} disabled={isLoading || !selectedSnippet} className="w-full">
          <WandSparkles className="mr-2 h-4 w-4" />
          {isLoading ? "Generating..." : "Explain Snippet"}
        </Button>
      </div>
    </div>
  );
}
