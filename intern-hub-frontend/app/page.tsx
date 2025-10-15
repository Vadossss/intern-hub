import { ActualInternships } from "@/components/shared/ActualInernships";
import { PopularCompanies } from "@/components/shared/PopularCompanies";
import { TopMainBody } from "@/components/shared/TopMainBody";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <TopMainBody />
      <PopularCompanies />
      <ActualInternships />
    </div>
  );
}
