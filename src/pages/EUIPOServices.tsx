import Header from "@/components/landing/Header";
import EUIPOHero from "@/components/euipo-landing/EUIPOHero";
import Footer from "@/components/landing/Footer";

const EUIPOServices = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <EUIPOHero />
        {/* Additional components can be added here later */}
      </main>
      <Footer />
    </div>
  );
};

export default EUIPOServices;