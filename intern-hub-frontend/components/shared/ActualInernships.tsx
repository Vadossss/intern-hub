import { Filters } from "../shared/FiltersSlidebar";

interface Props {
  className?: string;
}

export const ActualInternships: React.FC<Props> = ({}) => {
  return (
    <section className="py-15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-bold text-2xl mb-4 text-gray-900">
            Актуальные стажировки
          </h1>
          <div>
            <span className="text-md text-gray-600 max-w-xl mx-auto line-clamp-2">
              Найди идеальную стажировку среди 6 актуальных предложений
            </span>
          </div>
        </div>
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Filters></Filters>
          </div>
        </div>
      </div>
    </section>
  );
};
