import Header from "@/components/shared/HeaderH";
import HeroSection from "@/components/shared/HeroSection";
import StatsBar from "@/components/shared/StatsBar";
import CategoriesNav from "@/components/shared/CategoriesNav";
import FeaturedVacancies from "@/components/shared/FeaturedVacancies";
import PrepSection from "@/components/shared/PrepSection";
import EmployerCTA from "@/components/shared/EmployerCTA";
import Footer from "@/components/shared/Footer";

export default function HomePage() {
  return (
    <main>
      <Header />
      <HeroSection />
      <StatsBar />
      <CategoriesNav />
      <FeaturedVacancies />
      <PrepSection />
      <EmployerCTA />
      <Footer />
    </main>
  );
}
