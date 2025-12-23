"use client";

import { TaskCard, Task } from "./TaskCard";
import { Direction } from "./DirectionSelector";
import { Code } from "lucide-react";

interface Props {
  tasks: Task[];
  selectedDirection: Direction | null;
  className?: string;
}

export const TasksSection: React.FC<Props> = ({
  tasks,
  selectedDirection,
  className,
}) => {
  const filteredTasks = selectedDirection
    ? tasks.filter((t) => t.direction === selectedDirection)
    : tasks;

  if (filteredTasks.length === 0) {
    return (
      <section className={className}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">Текстовые задания</h2>
          </div>
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">
              {selectedDirection
                ? "Нет заданий для выбранного направления"
                : "Нет доступных заданий"}
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
          <Code className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">
            Текстовые задания {selectedDirection && `(${filteredTasks.length})`}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </section>
  );
};




