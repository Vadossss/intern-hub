import { CompanyCard } from "./CompanyCard";

interface Props {
  className?: string;
}

const companies = [
  {
    name: "Яндекс",
    logo: "/icons_companies/icon_sber.png",
    rating: 4.8,
    location: "Москва",
    employees: "10000+",
    openPositions: 15,
    description:
      "Технологическая компания, которая создаёт интеллектуальные продукты и сервисы",
    tags: ["IT", "Разработка", "Аналитика"],
  },
  {
    name: "Сбер",
    logo: "/icons_companies/icon_sber.png",
    rating: 4.5,
    location: "Москва",
    employees: "5000+",
    openPositions: 22,
    description: "Ведущий российский банк и технологическая компания",
    tags: ["Финтех", "IT", "Банкинг", "Финтех", "IT", "Банкинг"],
  },
  {
    name: "VK",
    logo: "/icons_companies/icon_sber.png",
    rating: 4.6,
    location: "СПб",
    employees: "3000+",
    openPositions: 8,
    description: "Создаём продукты, которые объединяют людей",
    tags: ["Соцсети", "IT", "Продукт"],
  },
  {
    name: "Т-Банк",
    logo: "/icons_companies/icon_tbank.png",
    rating: 4.7,
    location: "Москва",
    employees: "2000+",
    openPositions: 12,
    description: "Экосистема интернет-сервисов",
    tags: ["Финтех", "IT", "UX/UI"],
  },
];

export const PopularCompanies: React.FC<Props> = ({ className }) => {
  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-bold text-2xl mb-4 text-gray-900">
            Популярные компании
          </h1>
          <div>
            <span className="text-md text-gray-600 max-w-xl mx-auto line-clamp-2">
              Ведущие российские компании ищут талантливых стажеров.
              Присоединяйся к командам мечты.
            </span>
          </div>
        </div>
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {companies.map((company) => (
            <CompanyCard
              key={company.name}
              name={company.name}
              logo={company.logo}
              openPositions={company.openPositions}
              rating={company.rating}
              description={company.description}
              location={company.location}
              employees={company.employees}
              tags={company.tags}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
