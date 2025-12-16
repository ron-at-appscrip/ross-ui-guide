import Header from "@/components/landing/Header";
import USPTOHero from "@/components/uspto-landing/USPTOHero";
import USPTOFeatures from "@/components/uspto-landing/USPTOFeatures";
import ServiceTypes from "@/components/uspto-landing/ServiceTypes";
import USPTOProcess from "@/components/uspto-landing/USPTOProcess";
import USPTOMetrics from "@/components/uspto-landing/USPTOMetrics";
import IntegrationShowcase from "@/components/uspto-landing/IntegrationShowcase";
import CaseStudies from "@/components/uspto-landing/CaseStudies";
import USPTOPricing from "@/components/uspto-landing/USPTOPricing";
import Footer from "@/components/landing/Footer";
import TrademarkChatbot from "@/components/uspto-landing/TrademarkChatbot";

const USPTOServices = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <USPTOHero />
        <USPTOFeatures />
        <ServiceTypes />
        <USPTOProcess />
        <USPTOMetrics />
        <IntegrationShowcase />
        <CaseStudies />
        <USPTOPricing />
      </main>
      <Footer />
      <TrademarkChatbot />
    </div>
  );
};

export default USPTOServices;