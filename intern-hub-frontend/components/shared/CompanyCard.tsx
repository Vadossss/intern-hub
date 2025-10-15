import { MapPin, Star, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";

interface Props {
  className?: string;
  name: string;
  logo: string;
  rating?: number;
  description?: string;
  location?: string;
  employees?: string;
  tags?: string[];
  openPositions: number;
}

export const CompanyCard: React.FC<Props> = ({
  className,
  name,
  logo,
  rating,
  description,
  location,
  employees,
  tags,
  openPositions,
}) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer duration-300 gap-6">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center">
          {/* <h1 className="text-white font-bold">{logo}</h1> */}
          <img src={logo} alt={name} />
        </div>
        <div className="flex flex-col">
          <h1 className="font-semibold text-sm">{name}</h1>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm text-gray-700">{rating}</span>
          </div>
        </div>
      </div>
      <div className="">
        <span className="line-clamp-2 text-sm text-gray-700 mb-3">
          {description}
        </span>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-gray-700" />
          <span className="text-sm text-gray-700">{location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="size-4 text-gray-700 gap-1" />
          <span className="text-gray-700 text-sm">{employees}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1 mb-0">
        {tags?.map((tag, index) => (
          <Badge key={index}>{tag}</Badge>
        ))}
      </div>
      <div className="text-center text-sm text-blue-600 font-medium">
        <a href="#">{openPositions} открытых стажировок</a>
      </div>
    </Card>
  );
};
