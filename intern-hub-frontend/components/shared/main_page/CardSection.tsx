import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "lucide-react";
import Link from "next/link";
import { Direction } from "../DirectionSelector";

interface Props {
  className?: string;
  section: SectionProps;
  selectedDirection: Direction | string | null;
}

interface SectionProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: (dir: string | null) => string;
  color: string;
  iconColor: string;
}

export const CardSection: React.FC<Props> = ({
  className,
  section,
  selectedDirection,
}) => {
  const Icon = section.icon;
  return (
    <Link key={section.id} href={section.href(selectedDirection)}>
      <Card
        className={`${section.color} transition-all hover:shadow-lg cursor-pointer h-full`}
      >
        <CardHeader>
          <div className="flex items-center gap-8 mb-6">
            <div className={`p-3 rounded-lg bg-white ${section.iconColor}`}>
              <Icon className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">{section.title}</CardTitle>
          </div>
          <CardDescription className="text-base">
            {section.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};
