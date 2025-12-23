"use client";

import { VacancieCard } from "@/components/shared/VacancieCard";
import { useEffect, useState } from "react";

export default function JobPage() {
  const [vacancies, setVacancies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await fetch(
        "http://localhost:8080/internship/getVacancies?positionName=frontend",
        {
          method: "GET",
        }
      );
      const res = await data.json();
      console.log("Ono");

      setVacancies(res);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading</div>;
  }

  console.log(vacancies);

  return (
    <div className="grid grid-cols-2 gap-4 mt-5 m-auto max-w-7xl px-4 items-stretch">
      {vacancies.map((vacancie) => (
        <VacancieCard
          key={vacancie.id}
          name={vacancie.name}
          area={vacancie.area}
          salary={vacancie.salary}
          employer={vacancie.employer}
          key_skills={vacancie.key_skills}
          workFormat={vacancie.work_format}
          alternate_url={vacancie.alternate_url}
        />
      ))}
    </div>
  );
}
