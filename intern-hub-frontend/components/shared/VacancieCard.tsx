import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Avatar } from "../ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { BriefcaseBusiness, Wallet } from "lucide-react";
import Link from "next/link";

export type Area = {
  id: number;
  name: string;
  url: string;
};

export type Salary = {
  from: number;
  to: number;
  currency: string;
};

export type LogoUrl = {
  original: string;
  logo90: string;
  logo240: string;
};

export type Employer = {
  name: string;
  alternate_url: string;
  logo_urls: LogoUrl;
  vacancies_url: string;
};

export type KeySkill = {
  name: string;
};

export type WorkFormat = {
  id: "ON_SITE" | "REMOTE" | "HYBRID" | "FIELD_WORK" | "FLY_IN_FLY_OUT";
};

interface Props {
  className?: string;
  name: string;
  area: Area;
  salary: Salary;
  employer: Employer;
  key_skills: KeySkill[];
  workFormat: WorkFormat;
  alternate_url: string;
}

function formattingJobFormat(workFormat: WorkFormat | WorkFormat[]) {
  const formats = Array.isArray(workFormat) ? workFormat : [workFormat];

  const result = formats.map((format) => {
    switch (format.id) {
      case "ON_SITE":
        return "Офис";
      case "REMOTE":
        return "Удалённо";
      case "HYBRID":
        return "Гибрид";
      case "FIELD_WORK":
        return "Разъездная";
      case "FLY_IN_FLY_OUT":
        return "Вахта";
      default:
        return "Не указано";
    }
  });

  return result.length ? result : ["Не указано"];
}

function formattingName(name: string) {
  const arr = name.split(" ");
  if (arr.length > 1) {
    return `${arr[0][0].toLocaleUpperCase()}${arr[1][0].toLocaleUpperCase()}`;
  } else {
    return `${arr[0][0].toLocaleUpperCase()}${arr[0][1].toLocaleUpperCase()}`;
  }
}

function formattingSalary(salary: Salary) {
  if (salary === null) {
    return "Доход не указан";
  } else if (salary.from !== null && salary.to !== null) {
    return `${salary.from} - ${salary.to} ${salary.currency}`;
  } else if (salary.from !== null && salary.to === null) {
    return `${salary.from} ${salary.currency}`;
  } else {
    return `${salary.to} ${salary.currency}`;
  }
}

export const VacancieCard: React.FC<Props> = ({
  className,
  name,
  area,
  salary,
  employer,
  key_skills,
  workFormat,
  alternate_url,
}) => {
  return (
    <Link href={alternate_url}>
      <Card className="h-full flex flex-col justify-between bg-white rounded-lg shadow hover:shadow-xl ease-in-out duration-200">
        <CardHeader>
          <CardTitle className="font-bold text-xl">{name}</CardTitle>
          <CardDescription>
            <div className="flex gap-3 items-center font-light text-base text-black">
              <div className="flex gap-1">
                {/* <div>
                  <BriefcaseBusiness size={22} />
                </div> */}
                {formattingJobFormat(workFormat).map((format) => (
                  <Badge
                    key={format}
                    className="border-black"
                    variant="outline"
                  >
                    {format}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <div>
                  <Wallet className="fill-gray" size={20} />
                </div>
                <p className="font-light text-base text-black">
                  {formattingSalary(salary)}
                </p>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex">
              <div className="flex items-center gap-2 group hover:text-orange-300 ease-in-out duration-150">
                <div className="group-hover:scale-105 ease-in-out duration-150 group-hover:shadow-xl">
                  {employer.logo_urls !== null &&
                  employer.logo_urls.original !== null ? (
                    <img
                      src={employer.logo_urls.original}
                      className="size-10 rounded-lg"
                    />
                  ) : (
                    <Avatar className="p-5 bg-gray-300 flex justify-center items-center rounded-lg group-hover:bg-amber-600 duration-200 ease-in-out">
                      <AvatarFallback>
                        {formattingName(employer.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="flex flex-col">
                  <a className="font-bold" href={employer.alternate_url}>
                    {employer.name}
                  </a>
                  <p>{area.name ? area.name : "Не указано"}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 ">
              {key_skills.map((skill) => (
                <Badge key={skill.name} className="rounded-xl">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
