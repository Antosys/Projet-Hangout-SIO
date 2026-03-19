

import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import RealConnectionSection from "../components/RealConnectionSection";
import BenefitsSection from "../components/BenefitsSection";
import EventsSection from "../components/EventsSection";
import Footer from "../components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e4f1ff] via-white to-[#d8eafd] w-full flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <RealConnectionSection />
        <BenefitsSection />
        <EventsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

