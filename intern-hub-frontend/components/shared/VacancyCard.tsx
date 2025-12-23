"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Clock, DollarSign } from "lucide-react";
import { Direction } from "./DirectionSelector";
import Link from "next/link";

export interface Vacancy {
  id: string;
  name: string;
  // company: string;
  city: string;
  salary?: string;
  // type: "full-time" | "part-time" | "internship" | "contract";
  // experience: "junior" | "middle" | "senior";
  position: string;
  schedule: string;
  source: string;
  employmentForm: string;
}

interface Props {
  vacancy: Vacancy;
  className?: string;
}

const typeLabels = {
  "full-time": "Полный день",
  "part-time": "Неполный день",
  internship: "Стажировка",
  contract: "Контракт",
};

const experienceLabels = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
};

export const VacancyCard: React.FC<Props> = ({ vacancy, className }) => {
  return (
    <Card className={className}>
      <Link href={`/vacancies/${vacancy.id}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{vacancy.name}</CardTitle>
              <CardDescription className="flex items-center gap-4 text-base">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {/* {vacancy.company} */}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {vacancy.city}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {/* <Badge variant="secondary">{typeLabels[vacancy.type]}</Badge>
          <Badge variant="outline">
            {experienceLabels[vacancy.experience]}
          </Badge> */}
            {vacancy.salary && <p>{vacancy.salary}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge className="flex bg-green-200 text-black items-center gap-1">
              <Clock className="w-3 h-3" />
              {vacancy.employmentForm}
            </Badge>
            <Badge>{vacancy.schedule}</Badge>
          </div>
          {/* <p className="text-gray-700 mb-4 line-clamp-3">{vacancy.description}</p> */}
          {/* <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(vacancy.employmentForm).toLocaleDateString("ru-RU")}
          </span>
        </div> */}
        </CardContent>
      </Link>
    </Card>
  );
};
