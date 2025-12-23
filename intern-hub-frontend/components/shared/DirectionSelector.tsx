"use client";

import { Badge } from "@/components/ui/badge";
import { useStacks } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export type Direction =
  | "java"
  | "javascript"
  | "python"
  | "csharp"
  | "go"
  | "rust"
  | "php"
  | "kotlin";

interface DirectionInfo {
  id: Direction;
  name: string;
  icon: string;
}

const directions: DirectionInfo[] = [
  { id: "java", name: "Java", icon: "☕" },
  { id: "javascript", name: "JavaScript", icon: "📜" },
  { id: "python", name: "Python", icon: "🐍" },
  { id: "csharp", name: "C#", icon: "🔷" },
  { id: "go", name: "Go", icon: "🐹" },
  { id: "rust", name: "Rust", icon: "🦀" },
  { id: "php", name: "PHP", icon: "🐘" },
  { id: "kotlin", name: "Kotlin", icon: "🔶" },
];

interface Props {
  selectedDirection: string | null;
  onDirectionChange: (direction: string | null) => void;
  className?: string;
  showAllOption?: boolean;
}

export const DirectionSelector: React.FC<Props> = ({
  selectedDirection,
  onDirectionChange,
  className,
  showAllOption = false,
}) => {
  const { stacks, loading, error, refetch } = useStacks();

  if (loading) {
    return <div className="p-4">Загрузка стеков...</div>;
  }

  return (
    <div
      className={cn(
        "w-full flex flex-col justify-center items-center",
        className
      )}
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Выберите направление
      </h2>
      <div className="flex flex-wrap gap-3">
        {showAllOption && (
          <Badge
            variant={selectedDirection === "all" ? "default" : "outline"}
            className={cn(
              "px-4 py-2 text-base cursor-pointer transition-all hover:scale-105",
              selectedDirection === "all" &&
                "bg-primary text-primary-foreground"
            )}
            onClick={() => onDirectionChange("all")}
          >
            Все направления
          </Badge>
        )}
        {stacks.map((stack) => (
          <Badge
            key={stack.id}
            variant={selectedDirection === stack.id ? "default" : "outline"}
            className={cn(
              "px-4 py-2 text-base cursor-pointer transition-all hover:scale-105 flex items-center gap-2",
              selectedDirection === stack.id &&
                "bg-primary text-primary-foreground"
            )}
            onClick={() => onDirectionChange(stack.id)}
          >
            <span>{stack.name}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
};
