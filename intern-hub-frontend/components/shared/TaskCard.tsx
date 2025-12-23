"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Clock, TrendingUp } from "lucide-react";
import { Direction } from "./DirectionSelector";

export interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  direction: Direction;
  estimatedTime: string;
  tags: string[];
  solution?: string;
}

interface Props {
  task: Task;
  className?: string;
}

const difficultyLabels = {
  easy: { label: "Легкая", variant: "secondary" as const },
  medium: { label: "Средняя", variant: "default" as const },
  hard: { label: "Сложная", variant: "destructive" as const },
};

export const TaskCard: React.FC<Props> = ({ task, className }) => {
  const difficulty = difficultyLabels[task.difficulty];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              {task.title}
            </CardTitle>
            <CardDescription className="text-base">{task.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={difficulty.variant}>{difficulty.label}</Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {task.estimatedTime}
          </Badge>
          {task.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Уровень сложности</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">{difficulty.label}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <button className="text-primary hover:underline font-medium text-sm w-full text-center">
            Посмотреть задание →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};




