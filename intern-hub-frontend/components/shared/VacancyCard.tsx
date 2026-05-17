"use client";

import Link from "next/link";
import { Building2, Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface Vacancy {
  id: string;
  name?: string;
  title?: string;
  company?: string;
  city?: string;
  location?: string;
  salary?: string;
  type?: "full-time" | "part-time" | "internship" | "contract";
  experience?: "junior" | "middle" | "senior";
  direction?: string;
  description?: string;
  requirements?: string[];
  publishedAt?: string;
  position?: string;
  schedule?: string;
  source?: string;
  employmentForm?: string;
}

interface Props {
  vacancy: Vacancy;
  className?: string;
}

export const VacancyCard: React.FC<Props> = ({ vacancy, className }) => {
  const title = vacancy.name ?? vacancy.title ?? vacancy.position ?? "Вакансия";
  const city = vacancy.city ?? vacancy.location ?? "Город не указан";
  const company = vacancy.company ?? vacancy.source ?? "Компания";
  const employmentForm =
    vacancy.employmentForm ?? vacancy.type ?? "Формат не указан";
  const schedule = vacancy.schedule ?? vacancy.experience ?? "Не указано";

  return (
    <Card className={className}>
      <Link href={`/vacancies/${vacancy.id}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{title}</CardTitle>
              <CardDescription className="flex items-center gap-4 text-base">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {company}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {city}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {vacancy.salary ? <p>{vacancy.salary}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <Badge className="flex bg-green-200 text-black items-center gap-1">
              <Clock className="w-3 h-3" />
              {employmentForm}
            </Badge>
            <Badge>{schedule}</Badge>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
