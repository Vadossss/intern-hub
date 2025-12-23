"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Lightbulb, BookOpen } from "lucide-react";
import { Direction } from "./DirectionSelector";

export interface InterviewQuestion {
  id: string;
  question: string;
  category: "technical" | "behavioral" | "system-design" | "algorithm";
  difficulty: "easy" | "medium" | "hard";
  direction: Direction;
  answer?: string;
  tips?: string[];
  tags: string[];
}

interface Props {
  question: InterviewQuestion;
  className?: string;
}

const categoryLabels = {
  technical: "Технический",
  behavioral: "Поведенческий",
  "system-design": "Системный дизайн",
  algorithm: "Алгоритмы",
};

const difficultyLabels = {
  easy: { label: "Легкий", variant: "secondary" as const },
  medium: { label: "Средний", variant: "default" as const },
  hard: { label: "Сложный", variant: "destructive" as const },
};

export const InterviewQuestionCard: React.FC<Props> = ({ question, className }) => {
  const difficulty = difficultyLabels[question.difficulty];
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Вопрос
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {question.question}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={difficulty.variant}>{difficulty.label}</Badge>
          <Badge variant="outline">{categoryLabels[question.category]}</Badge>
          {question.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {question.tips && question.tips.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm text-blue-900 mb-1">Подсказки:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                  {question.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {question.answer && (
          <div className="mb-4">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="flex items-center gap-2 text-primary hover:underline font-medium text-sm mb-2"
            >
              <BookOpen className="w-4 h-4" />
              {showAnswer ? "Скрыть ответ" : "Показать ответ"}
            </button>
            {showAnswer && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-line">{question.answer}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <button className="text-primary hover:underline font-medium text-sm w-full text-center">
            Обсудить вопрос →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

