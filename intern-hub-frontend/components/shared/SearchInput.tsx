import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface Props {
  className?: string;
}

export const SearchInput: React.FC<Props> = ({ className }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mx-auto">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10 h-12 bg-background "
          placeholder="Поиск по специальности"
        />
      </div>
      <Button className="h-12 px-6">Найти стажировку</Button>
    </div>
  );
};
