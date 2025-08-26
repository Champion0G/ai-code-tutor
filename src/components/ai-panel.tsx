"use client";

import { useGamification } from "@/contexts/gamification-context";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExplainTab } from "./ai/explain-tab";
import { ImproveTab } from "./ai/improve-tab";
import { SummaryTab } from "./ai/summary-tab";
import { QuizTab } from "./ai/quiz-tab";
import type { BadgeName } from "@/contexts/gamification-context";

interface AiPanelProps {
  fileContent: string;
  fileName: string;
  selectedSnippet: string;
  setSelectedSnippet: (snippet: string) => void;
}

export function AiPanel({
  fileContent,
  fileName,
  selectedSnippet,
  setSelectedSnippet
}: AiPanelProps) {
  const { addXp, addBadge } = useGamification();

  const handleActionSuccess = (xp: number, badge?: BadgeName) => {
    addXp(xp);
    if (badge) {
      addBadge(badge);
    }
  };

  return (
    <Card className="h-full max-h-[calc(100vh-8rem)]">
      <CardContent className="p-4 h-full">
        <Tabs defaultValue="explain" className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="explain">Explain</TabsTrigger>
            <TabsTrigger value="improve">Improve</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-hidden mt-4">
              <TabsContent value="explain" className="h-full m-0">
                <ExplainTab
                  selectedSnippet={selectedSnippet}
                  onExplanation={() => handleActionSuccess(10, "First_Explanation")}
                />
              </TabsContent>
              <TabsContent value="improve" className="h-full m-0">
                <ImproveTab
                  selectedSnippet={selectedSnippet}
                  onImprovement={() => handleActionSuccess(25, "Code_Optimizer")}
                />
              </TabsContent>
              <TabsContent value="summary" className="h-full m-0">
                <SummaryTab
                  fileContent={fileContent}
                  fileName={fileName}
                  onSummary={() => handleActionSuccess(15, "Archivist")}
                />
              </TabsContent>
              <TabsContent value="quiz" className="h-full m-0">
                <QuizTab
                  fileName={fileName}
                  fileContent={fileContent}
                  onCorrectAnswer={() => handleActionSuccess(20, "Quiz_Whiz")}
                />
              </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
