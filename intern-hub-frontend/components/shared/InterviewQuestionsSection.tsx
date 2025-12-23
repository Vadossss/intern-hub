"use client";

import { InterviewQuestionCard, InterviewQuestion } from "./InterviewQuestionCard";
import { Direction } from "./DirectionSelector";
import { MessageSquare } from "lucide-react";

interface Props {
  questions: InterviewQuestion[];
  selectedDirection: Direction | null;
  className?: string;
}

export const InterviewQuestionsSection: React.FC<Props> = ({
  questions,
  selectedDirection,
  className,
}) => {
  const filteredQuestions = selectedDirection
    ? questions.filter((q) => q.direction === selectedDirection)
    : questions;

  if (filteredQuestions.length === 0) {
    return (
      <section className={className}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">Вопросы с собеседований</h2>
          </div>
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">
              {selectedDirection
                ? "Нет вопросов для выбранного направления"
                : "Нет доступных вопросов"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">
            Вопросы с собеседований {selectedDirection && `(${filteredQuestions.length})`}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.map((question) => (
            <InterviewQuestionCard key={question.id} question={question} />
          ))}
        </div>
      </div>
    </section>
  );
};




